"""Place real-screen explanations beside the relevant user tasks in both languages."""
from pathlib import Path
import json,re
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
data_path=ROOT/'content/system-tours.json'
data=json.loads(data_path.read_text(encoding='utf-8'))
data['admin']['intro']={'en':'Choose a step or a number on the screenshot to learn what it does and when to use it','ar':'اختر خطوة من القائمة أو رقماً على الصورة لتعرف وظيفة الجزء ومتى تستخدمه'}
for step,focus in zip(data['customer']['steps'],[[3,39,22,31],[28,24,67,18],[28,43,67,22],[28,69,67,20]]):step['focus']=focus
data['products']={
 'title':{'en':'Find and inspect a product','ar':'ابحث عن منتج وافحص تفاصيله'},
 'intro':{'en':'A tenant catalog example: find the offer, inspect its identity, then review its variants','ar':'مثال من كتالوج المتجر: ابحث عن العرض وافحص هويته ثم راجع المتغيرات'},
 'video':True,
 'steps':[
  {'image':'tenant-products.jpg','focus':[32,33,42,8],'title':{'en':'Search names, SKUs and slugs','ar':'ابحث بالاسم أو رمز الصنف أو الرابط'},'body':{'en':'Use the list search and filters to find the right product. Open its name to inspect the record before editing.','ar':'استخدم البحث والمرشحات لتحديد المنتج الصحيح. افتح اسمه لمراجعة السجل قبل التعديل.'},'guide':'features/products'},
  {'image':'tenant-product-detail.jpg','focus':[21,20,75,16],'title':{'en':'Check the product and its state','ar':'تحقق من المنتج وحالته'},'body':{'en':'The product name, type and status identify the offer. Edit is available only with the required permission. Saving a record is different from publishing it.','ar':'يحدد الاسم والنوع والحالة هوية العرض. يتطلب التعديل صلاحية مناسبة. حفظ السجل يختلف عن نشره.'},'guide':'features/products'},
  {'image':'tenant-product-detail.jpg','focus':[21,39,74,8],'title':{'en':'Review variants and related content','ar':'راجع المتغيرات والمحتوى المرتبط'},'body':{'en':'Variants, images and categories have separate tabs. A cart buys a variant, so review the actual option, its price and stock rather than just the parent product.','ar':'للمتغيرات والصور والتصنيفات تبويبات مستقلة. تشتري السلة متغيراً، لذلك راجع الخيار الفعلي وسعره ومخزونه لا المنتج الأب فقط.'},'guide':'features/attributes'}
 ]}
data_path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sizes={}
for image_path in sorted((ROOT/'public/screenshots').glob('*.jpg')):
 with Image.open(image_path) as image:sizes[image_path.name]={'width':image.width,'height':image.height}
(ROOT/'content/screenshot-sizes.json').write_text(json.dumps(sizes,indent=2)+'\n',encoding='utf-8')

for lang in ['en','ar']:
 ar=lang=='ar';base=ROOT/'content/docs'/lang
 for role in ['admin','tenant','vendor','customer']:
  p=base/'roles'/(role+'.mdx');s=p.read_text(encoding='utf-8')
  if '<SystemTour ' not in s:
   headings=list(re.finditer(r'(?m)^## ',s));pos=headings[1].start()
   s=s[:pos]+f'<SystemTour tour="{role}" />\n\n'+s[pos:]
  s=re.sub(r'<img src="/docs/screenshots/[^"]+" alt="[^"]*" />\s*\n','',s)
  marker='{/* ROUTE_MAP */}';end='{/* /ROUTE_MAP */}'
  if 'guide-technical-details' not in s:
   label='مسارات الشاشات للمراجعة التقنية' if ar else 'Screen paths for technical reference'
   s=s.replace(marker,f'<details className="guide-technical-details">\n<summary>{label}</summary>\n\n'+marker).replace(end,end+'\n\n</details>')
  p.write_text(s,encoding='utf-8')
 for feature,tour,start in [('products','products',0),('orders','orders',0),('invoices','customer',1),('payments','customer',2),('vendors','vendor',0),('dashboards','tenant',0)]:
  p=base/'features'/(feature+'.mdx');s=p.read_text(encoding='utf-8')
  if '<SystemTour ' not in s:
   target='## القيود والقرارات' if ar else '## Restrictions and decisions'
   s=s.replace(target,f'<SystemTour tour="{tour}" compact startAt={{{start}}} />\n\n'+target)
  p.write_text(s,encoding='utf-8')
 for p in (base/'features').glob('*.mdx'):
  s=p.read_text(encoding='utf-8');marker='{/* SCREEN_MAP */}';end='{/* /SCREEN_MAP */}'
  if 'guide-technical-details' not in s:
   label='مسارات الشاشات ومراجع المصدر' if ar else 'Screen paths and source references'
   s=s.replace(marker,f'<details className="guide-technical-details">\n<summary>{label}</summary>\n\n'+marker).replace(end,end+'\n\n</details>')
   p.write_text(s,encoding='utf-8')
 p=base/'screenshots.mdx';s=p.read_text(encoding='utf-8')
 if '<SystemTour ' not in s:
  for image,tour in [('admin-dashboard.jpg','admin'),('tenant-dashboard.jpg','tenant'),('vendor-dashboard.jpg','vendor'),('customer-account.jpg','customer'),('admin-orders.jpg','orders')]:
   s=re.sub(r'<img src="/docs/screenshots/'+re.escape(image)+r'" alt="[^"]*" />',f'<SystemTour tour="{tour}" />',s)
  s=re.sub(r'<img src="([^"]+)" alt="([^"]*)" />',r'<SystemScreenshot src="\1" alt="\2" />',s)
  heading='## تعرف على المنتج من شاشة فعلية' if ar else '## Inspect a real product'
  s+='\n'+heading+'\n\n<SystemTour tour="products" />\n'
  p.write_text(s,encoding='utf-8')
 p=base/'start.mdx';s=p.read_text(encoding='utf-8')
 if '(learn)' not in s:
  line='تفضل التعلم من الصور؟ [ابدأ بالجولات التفاعلية والفيديوهات القصيرة](learn).' if ar else 'Prefer learning from the screen? [Open the interactive walkthroughs and short videos](learn).'
  first=s.index('\n## ');s=s[:first]+'\n\n'+line+'\n'+s[first:];p.write_text(s,encoding='utf-8')
 title='تعلم النظام بالصور والفيديو' if ar else 'Learn the system with screen tours'
 intro='اختر دورك، ثم اتبع الأرقام على شاشة فعلية. استخدم التكبير للتفاصيل أو افتح الفيديو القصير مع شرح بلغتك. تعرض الصور حسابات تجريبية ولا تنفذ أية عملية على النظام.' if ar else 'Choose your role, then follow numbered callouts on a real screen. Enlarge the image for detail or watch a short captioned tour. These examples use demo accounts and do not perform actions in the system.'
 body='\n\n'.join('## '+({'admin':'إدارة المنصة','tenant':'إدارة المتجر','vendor':'البائع','customer':'العميل'}[r] if ar else {'admin':'Platform admin','tenant':'Tenant operator','vendor':'Vendor','customer':'Customer'}[r])+f'\n\n<SystemTour tour="{r}" />\n\n['+('افتح الدليل الكامل' if ar else 'Open the full handbook')+f'](roles/{r})' for r in ['admin','tenant','vendor','customer'])
 (base/'learn.mdx').write_text('---\ntitle: '+json.dumps(title,ensure_ascii=False)+'\ndescription: '+json.dumps(intro,ensure_ascii=False)+'\n---\n\n'+intro+'\n\n'+body+'\n',encoding='utf-8')
 p=base/'meta.json';meta=json.loads(p.read_text(encoding='utf-8'))
 if 'learn' not in meta['pages']:meta['pages'].insert(1,'learn')
 p.write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Attached role, feature and gallery tours; wrote a bilingual visual-learning hub.')
