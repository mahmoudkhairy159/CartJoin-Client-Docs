from pathlib import Path
import re,json,subprocess,hashlib
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT.parent;BACK=BASE/'CartJoin-Backend'
FEATURE_MODULES={
'access':['Auth'],'team':['Admin','TenantAdmin','VendorAdmin'],'tenants':['Tenant'],'vendors':['Vendor'],'vendor-profile':['Vendor'],
'customers':['User'],'categories':['Category'],'brands':['Brand'],'products':['Product'],'attributes':['Product'],
'pricing':['Pricing','PriceList'],'inventory':['Inventory'],'search':['Search','RecommendationEngine'],'wishlist':['Wishlist'],'cart':['Cart'],
'checkout':['Invoice'],'orders':['Order'],'invoices':['Invoice'],'payments':['Payment'],'refunds':['Refund'],'returns':['OrderReturn'],
'shipping':['Shipping'],'shipping-providers':['ShippingProvider'],'coupons':['Coupon'],'promotions':['Promotion'],'flash-sales':['FlashSale'],
'gift-cards':['GiftCard'],'loyalty':['Loyalty'],'wallet':['Wallet'],'commission':['Commission'],'settlements':['SettlementPayout'],
'tax-currency':['Tax','Currency'],'cms':['Cms'],'banners':['Banner'],'storefront':['Storefront'],'seo':['Seo'],'reviews':['Review'],
'support':['SupportTicket','Faqs'],'notifications':['Notification'],'dashboards':['Dashboard'],'reports':['Reports','Core'],
'audit':['AuditLog'],'webhooks':['Webhook'],'settings':['Settings','Core','Area']}
MAP={}
def assign(feature,paths):
    for p in paths.split():MAP[p]=feature
assign('access','auth profile');assign('team','admins roles tenant-admins tenant-roles vendor-admins vendor-roles vendor-staff')
assign('tenants','tenants tenant-branches my-store');assign('vendors','vendors tenant-vendors workspace-terms');assign('vendor-profile','vendor-profile')
assign('customers','users user-groups');assign('products','products');assign('attributes','attributes');assign('categories','categories');assign('brands','brands')
assign('pricing','product-prices price-lists');assign('tax-currency','taxes currencies');assign('inventory','inventory inventory/balances')
assign('orders','orders');assign('invoices','invoices invoice-sequences');assign('payments','payments payment-gateways');assign('refunds','refunds');assign('returns','returns')
assign('shipping','shipping shipping-zones shipping-methods shipping-rates shipments shipping-rate-quotes');assign('shipping-providers','shipping-providers')
assign('coupons','coupons');assign('promotions','promotions');assign('flash-sales','flash-sales flash');assign('search','recommendations search-query-log shop')
assign('gift-cards','gift-cards gift-card-policies');assign('loyalty','loyalty');assign('wallet','wallet');assign('commission','commissions commission-rules commission-adjustments')
assign('settlements','settlements payouts settlement-settings');assign('cms','cms cms/pages cms/content-blocks cms/navigation-menus journal pages/:slug page/:slug')
assign('banners','banners');assign('storefront','storefront storefront-settings maintenance');assign('seo','seo');assign('reviews','reviews questions review-settings')
assign('support','support-tickets faqs faq-categories');assign('notifications','notifications');assign('dashboards','dashboard account')
assign('reports','reports jobs');assign('audit','audit-logs');assign('settings','configs tags colors platform-settings feature-flags settings reference-data geo store-configuration')
assign('products','product/:slug');assign('vendors','vendor');assign('tenants','branches');assign('cart','cart');assign('checkout','checkout');assign('shipping','track/:orderNo')
assign('wishlist','wishlist');assign('support','support');assign('webhooks','webhooks')
SPECIAL={'forbidden':'Access error screen','**':'Not-found fallback','dev/style-guide':'Development-only visual reference'}
SURFACES={'admin':'CartJoin-Admin-Dashboard-Frontend','tenant':'CartJoin-Tenant-Dashboard-Frontend','vendor':'CartJoin-Vendor-Dashboard-Frontend','customer':'CartJoin-Storefront-Frontend'}
inventory={'reviewed':'2026-11-17','verification':'Source extraction plus selected read-only demo observations; no transactional acceptance tests.','repositories':{},'surfaces':{},'features':{}}
def git(repo,*args):
    return subprocess.check_output(['git','-C',str(repo),*args],text=True,encoding='utf-8').strip()
def clean(s):return re.sub(r'/\*.*?\*/|(?m:^[ \t]*//[^\r\n]*$)','',s,flags=re.S)
for name in ['CartJoin-Backend',*SURFACES.values()]:
    repo=BASE/name
    inventory['repositories'][name]={'commit':git(repo,'rev-parse','HEAD'),'branch':git(repo,'branch','--show-current'),'dirty':bool(git(repo,'status','--porcelain'))}
for surface,name in SURFACES.items():
    repo=BASE/name;path=repo/'src/app/app.routes.ts';raw=path.read_text(encoding='utf-8')
    paths=list(dict.fromkeys(re.findall(r"\bpath:\s*'([^']*)'",clean(raw))))
    records=[]
    for p in paths:
        if not p:continue
        if p not in MAP and p not in SPECIAL:raise ValueError(f'Unmapped route {surface}: {p}')
        records.append({'path':'/'+p,'feature':MAP.get(p),'special':SPECIAL.get(p)})
    routefiles={str(p.relative_to(repo)).replace('\\','/'):list(dict.fromkeys(re.findall(r"\bpath:\s*'([^']*)'",clean(p.read_text(encoding='utf-8'))))) for p in (repo/'src/app/features').rglob('*.routes.ts') if not p.name.endswith('.spec.ts')}
    if surface=='customer':
        account=routefiles.get('src/app/features/account/account.routes.ts',[])
        for p in account:
            if not p:continue
            first=p.split('/')[0];feature=MAP.get(first,'customers' if first=='profile' else None)
            if not feature:raise ValueError('Unmapped account route '+p)
            records.append({'path':'/account/'+p,'feature':feature,'special':None})
    inventory['surfaces'][surface]={'repository':name,'root_routes':records,'child_route_files':routefiles,'route_source_sha256':hashlib.sha256(raw.encode()).hexdigest()}
for feature,modules in FEATURE_MODULES.items():
    sources=[];routes=[];fields=[];enums=[]
    for module in modules:
        folder=BACK/'Modules'/module
        for p in sorted((folder/'routes').glob('*.php')):
            s=clean(p.read_text(encoding='utf-8-sig'))
            for method,uri,ctrl,action in re.findall(r"Route::(get|post|put|patch|delete)\(\s*'([^']+)'\s*,\s*\[\s*(\w+)::class\s*,\s*'([^']+)'",s):
                routes.append({'module':module,'file':str(p.relative_to(BACK)).replace('\\','/'),'method':method.upper(),'uri':uri,'controller':ctrl,'action':action})
            sources.append(str(p.relative_to(BACK)).replace('\\','/'))
        for p in sorted((folder/'App/Http/Requests').rglob('*.php')):
            s=p.read_text(encoding='utf-8-sig')
            names=list(dict.fromkeys(re.findall(r"['\"]([\w.*]+)['\"]\s*=>",s)))
            if names:fields.append({'file':str(p.relative_to(BACK)).replace('\\','/'),'fields':names})
        for p in sorted((folder/'App/Enums').glob('*.php')):
            cases=re.findall(r'case\s+(\w+)\s*=\s*([^;]+);',p.read_text(encoding='utf-8-sig'))
            if cases:enums.append({'file':str(p.relative_to(BACK)).replace('\\','/'),'cases':dict(cases)})
    inventory['features'][feature]={'modules':modules,'route_sources':sources,'explicit_backend_routes':routes,'request_fields':fields,'enums':enums}
(ROOT/'evidence').mkdir(exist_ok=True)
(ROOT/'evidence/source-inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def putpage(lang,slug,title,desc,body):
    p=ROOT/'content/docs'/lang/(slug+'.mdx');p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text('---\n'+f'title: {json.dumps(title,ensure_ascii=False)}\ndescription: {json.dumps(desc,ensure_ascii=False)}\n---\n\n'+body+'\n',encoding='utf-8')

for lang in ['en','ar']:
    a=lang=='ar'
    for surface,s in inventory['surfaces'].items():
        p=ROOT/'content/docs'/lang/'roles'/(surface+'.mdx');text=p.read_text(encoding='utf-8')
        rows=['| '+('مسار الواجهة | الدليل |' if a else 'Frontend path | Feature guide |'),'|---|---|']
        for r in s['root_routes']:
            target=f"[{'شرح الخاصية' if a else r['feature']}](../features/{r['feature']})" if r['feature'] else (r['special'] or '')
            rows.append(f"| `{r['path']}` | {target} |")
        table='\n'.join(rows)
        text=re.sub(re.escape('{/* ROUTE_MAP */}')+'.*?'+re.escape('{/* /ROUTE_MAP */}'),'{/* ROUTE_MAP */}\n'+table+'\n{/* /ROUTE_MAP */}',text,flags=re.S) if '{/* /ROUTE_MAP */}' in text else text.replace('{/* ROUTE_MAP */}','{/* ROUTE_MAP */}\n'+table+'\n{/* /ROUTE_MAP */}')
        p.write_text(text,encoding='utf-8')
    evidence=('## طريقة القراءة\n\nالأدلة التالية مستخرجة من المصدر المحلي وليست نتائج اختبار قبول. المسار أدناه جزء من ملف توجيه الوحدة، وقد يضاف له بادئ ومجموعة ومحدد صلاحية. أسماء الحقول لا تعني أن كل حقل مطلوب أو قابل للتعديل؛ تحكمها قواعد النموذج والسياق. لا تعرض القائمة أسراراً أو قيماً للبيئة.\n\n' if a else '## How to read this evidence\n\nThe following is extracted from local source, not acceptance-test results. Backend URI fragments may inherit prefixes, route groups and permissions. A field name does not imply that it is required or editable; its Form Request and context define that. The inventory excludes environment values and credentials.\n\n')
    evidence+='| Repository | Commit | Local changes present |\n|---|---|---|\n'
    for repo,state in inventory['repositories'].items():evidence+=f"| `{repo}` | `{state['commit'][:12]}` | {'Yes' if state['dirty'] else 'No'} |\n"
    evidence+='\n'+('## دليل كل خاصية\n\n' if a else '## Per-feature source trail\n\n')
    for f,d in inventory['features'].items():
        feature_path=ROOT/'content/docs'/lang/'features'/(f+'.mdx')
        feature_text=feature_path.read_text(encoding='utf-8')
        screen_block=('## مواضع الخاصية في الواجهات\n\nوجود المسار يثبت التنقل ولا يمنح كل الإجراءات. قد توجد وظائف إضافية داخل تفاصيل سجل مرتبط.\n\n' if a else '## Where this feature appears\n\nA route proves navigation, not permission to perform every action. Related-record detail tabs can expose additional entry points.\n\n')
        screen_block+='| Dashboard | Frontend entry paths |\n|---|---|\n'
        for surface,surface_data in inventory['surfaces'].items():
            paths=[r['path'] for r in surface_data['root_routes'] if r['feature']==f]
            if paths:screen_block+=f"| [{surface}](../roles/{surface}) | "+', '.join('`'+p+'`' for p in paths)+' |\n'
        if f=='wishlist':screen_block+='\n'+('يمكن الوصول من أدوات المنتج وقائمة المفضلة بحساب العميل.' if a else 'Also reached from product wishlist controls and the customer account navigation.')+'\n'
        screen_block+='\n'+('[المسارات والحقول والحالات من المصدر](../evidence/'+f+')' if a else '[Exact route, field and enum source trail](../evidence/'+f+')')+'\n'
        marker='{/* SCREEN_MAP */}';end='{/* /SCREEN_MAP */}'
        if marker in feature_text:feature_text=re.sub(re.escape(marker)+'.*?'+re.escape(end),marker+'\n'+screen_block+end,feature_text,flags=re.S)
        else:feature_text+='\n'+marker+'\n'+screen_block+end+'\n'
        feature_path.write_text(feature_text,encoding='utf-8')
        evidence+=f"- [{f}](evidence/{f}): "+', '.join('`Modules/'+m+'`' for m in d['modules'])+f" · {len(d['explicit_backend_routes'])} explicit route declarations\n"
        b=('## المراجع\n\n' if a else '## Source locations\n\n')+'\n'.join('- `'+s+'`' for s in d['route_sources'])
        b+='\n\n'+('## مسارات الخادم المستخرجة\n\n' if a else '## Extracted explicit backend routes\n\n')
        b+='| Module | Surface file | Method | URI fragment | Action |\n|---|---|---|---|---|\n'
        for r in d['explicit_backend_routes']:b+=f"| {r['module']} | `{Path(r['file']).name}` | {r['method']} | `{r['uri']}` | `{r['action']}` |\n"
        if not d['explicit_backend_routes']:b+='\nNo explicit controller-array route declarations were extracted. Inspect the source for grouped/helper/resource routes.\n'
        b+='\n'+('## حقول النماذج\n\n' if a else '## Form-request field names\n\n')
        for field in d['request_fields']:b+='- `'+field['file']+'`: '+', '.join('`'+n+'`' for n in field['fields'])+'\n'
        b+='\n'+('## قيم الحالات من المصدر\n\n' if a else '## Enum values in source\n\n')
        for enum in d['enums']:b+='- `'+enum['file']+'`: '+', '.join('`'+k+' = '+v.replace('|',' / ')+'`' for k,v in enum['cases'].items())+'\n'
        b+='\n'+('[العودة للأدلة](../evidence) · [شرح الخاصية](../features/'+f+')' if a else '[Back to evidence](../evidence) · [Business guide](../features/'+f+')')
        # Evidence is one level deeper than its parent; use explicit language-root URLs.
        b=b.replace('(../evidence)',f'(/{lang}/evidence)').replace('(../features/',f'(/{lang}/features/')
        putpage(lang,'evidence/'+f,('أدلة المصدر: ' if a else 'Source evidence: ')+f,'Extracted backend routes, request fields and enum values.',b)
    putpage(lang,'evidence','أدلة المصدر والإصدارات' if a else 'Source evidence and versions','Source snapshot and extracted contracts.',evidence)
    p=ROOT/'content/docs'/lang/'evidence/meta.json';p.write_text(json.dumps({'title':'مرجع المصدر' if a else 'Source appendix','defaultOpen':False,'pages':list(FEATURE_MODULES)},ensure_ascii=False,indent=2),encoding='utf-8')
    coverage=('## نطاق الإصدار\n\n44 دليلاً للخصائص وأربعة أدلة للأدوار وثلاثة مسارات رئيسية للعمل بكل لغة، مع مرجع مصدر مفصل. تعتمد خريطة التنقل على ملفات الواجهات الأربع، بينما تستند قواعد العمل إلى الوثائق والخدمات والتحقق المحدد من المصدر.\n\n' if a else '## Edition scope\n\n44 feature guides, four role handbooks and three main business workflows in each language, with detailed source appendices. Navigation coverage comes from all four frontend route trees. Business guidance uses module documents and targeted source review of services, routes and constraints.\n\n')
    coverage+='| Surface | Mapped route entries | Child route files inspected by extraction |\n|---|---|---|\n'
    for s,d in inventory['surfaces'].items():coverage+=f"| [{s}](roles/{s}) | {len(d['root_routes'])} | {len(d['child_route_files'])} |\n"
    coverage+=('\n## ما تم التحقق منه\n\n- استخراج مسارات الواجهات وربط كل مدخل بدليل أو شاشة خطأ/تطوير مصنفة.\n- مراجعة وحدة الفاتورة والشراء والطلب وقواعد المخزون والدفع والاسترداد وعدة ضوابط مالية.\n- دخول حسابات العرض وملاحظة شاشات مختارة والتقاط صور فعلية.\n\n## حدود وملاحظات\n\n- لم تنفذ عمليات شراء أو دفع أو تحويل أو تعديل بيانات عمل لجمع الصور.\n- لم تشغل اختبارات تطبيقات كارت جوين؛ فحص الدليل وبناؤه منفصلان عنها.\n- لا يثبت وجود مسار اكتمال منطق الميزة. بعض التسعير والعروض محدودة، والتوصيات المتقدمة مؤجلة.\n- تحتوي وثائق الخادم على فقرات قديمة متعارضة بشأن الجاهزية، لذلك لم تعتمد عبارة «كل الوحدات مكتملة».\n- تدفق العميل الحالي مبني على الفواتير؛ لفظ «الطلبات» في بعض الروابط يعرض مشتريات الفاتورة.\n- عبارات الصفحة الرئيسية بشأن الإرجاع والشحن وطرق الدفع أمثلة عرض، ولا تستبدل إعدادات كل متجر.\n- مراجعة المصدر لا تثبت تطابق الإصدار المنشور مع الشيفرة المحلية؛ الصور تعكس ما ظهر في تاريخها.\n\n' if a else '\n## What was checked\n\n- Extracted frontend routes and mapped every entry to a guide or classified error/developer screen.\n- Reviewed checkout/invoice/order ownership and inventory, payment, refund and selected finance constraints.\n- Signed into demo accounts and observed selected screens with real screenshots.\n\n## Limits and known gaps\n\n- No purchases, payments, transfers or business-record changes were performed to collect screenshots.\n- CartJoin application test suites were not run. Documentation checks/builds are separate.\n- A route is not proof of a complete feature. General Pricing and Promotion remain thin in the status index; advanced recommendations are deferred.\n- Backend documentation contains stale contradictory readiness paragraphs, so this guide does not assert that every module is complete.\n- The current buyer surface is invoice-based; some paths labeled orders display invoice purchases.\n- Homepage copy about return days, shipping and payment options is demo content, not a universal tenant policy.\n- Local source review does not establish that the deployed build matches the checkout. Screenshots reflect the observed deployment on their date.\n\n')
    coverage+=('[الصور](screenshots) · [أدلة المصدر](evidence)' if a else '[Screenshot provenance](screenshots) · [Source evidence](evidence)')
    putpage(lang,'coverage','تغطية الشاشات وحدود التحقق' if a else 'Dashboard coverage and verification limits','Source-based coverage with honest readiness labels.',coverage)
print('Recorded source inventory and mapped every root route.')
