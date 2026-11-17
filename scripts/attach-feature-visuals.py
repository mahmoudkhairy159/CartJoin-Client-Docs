"""Attach reviewed dashboard captures and bilingual screen-reading explanations."""
from pathlib import Path
import json,re,shutil
from PIL import Image
R=Path(__file__).resolve().parents[1]
captures=json.loads((R/'evidence/feature-captures.json').read_text(encoding='utf-8'))
tours=json.loads((R/'content/system-tours.json').read_text(encoding='utf-8'))
COPY='''access|Profile and account security|الملف وأمان الحساب|Use the profile and security controls for your own account. Changing personal details does not grant new dashboard permissions.|استخدم أدوات الملف والأمان لحسابك. تعديل البيانات الشخصية لا يمنح صلاحيات جديدة في لوحة التحكم.
attributes|Describe product choices|وصف خيارات المنتج|Attributes describe choices such as colour, size and material. The empty demo list does not mean a product already has configured variants.|تصف السمات خيارات اللون والمقاس والخامة. فراغ القائمة التجريبية لا يعني أن متغيرات المنتج مضبوطة مسبقاً.
audit|Trace a recorded action|تتبع إجراء مسجل|Match the event, time, affected record and actor. Use the tenant scope before investigating a record; a log entry is evidence of that event only.|طابق الحدث والوقت والسجل المتأثر ومن نفذ الإجراء. حدد نطاق المتجر قبل التحقيق؛ يثبت الإدخال الحدث المسجل فقط.
banners|Plan where a banner appears|تحديد موضع اللافتة|Check placement, destination link, schedule, display order and active state together. An active flag alone does not override the publication period.|راجع الموضع والرابط والجدول وترتيب العرض والحالة معاً. التفعيل وحده لا يتجاوز فترة النشر.
brands|Read a catalog label|قراءة علامة الكتالوج|Brands label products; vendors fulfill purchases. Check the name and slug before linking a product to a brand.|تصنف العلامات المنتجات بينما ينفذ البائعون المشتريات. راجع الاسم والرابط قبل ربط المنتج بعلامة.
cart|Review your basket|مراجعة السلة|Check each variant, quantity and unit price against its line total, then review discounts and the summary. The expiry is shown as a date and time.|طابق المتغير والكمية وسعر الوحدة مع إجمالي البند، ثم راجع الخصومات والملخص. يظهر انتهاء السلة بتاريخ ووقت.
categories|Read the category hierarchy|قراءة شجرة التصنيفات|The parent column distinguishes a top-level category from a child. Check the name, slug and state before assigning products.|يميز عمود الأب التصنيف الرئيسي من الفرعي. راجع الاسم والرابط والحالة قبل إسناد المنتجات.
checkout|Start with the delivery address|البدء بعنوان التوصيل|The capture shows the Address stage, the four checkout stages and the vendor split. Choose an address before requesting delivery options; no purchase was placed for capture.|تعرض الصورة مرحلة العنوان ومراحل الشراء الأربع والتقسيم حسب البائع. اختر عنواناً قبل طلب خيارات التوصيل؛ لم ينشأ شراء لالتقاط الصورة.
cms|Separate drafts from published content|التمييز بين المسودة والمحتوى المنشور|Read title, slug, publication state and date. Saving a draft does not make a page visible to customers.|راجع العنوان والرابط وحالة النشر وتاريخه. حفظ المسودة لا يجعل الصفحة ظاهرة للعملاء.
commission|Understand the commission entry|فهم قيد العمولة|Match each commission to its order, rate, currency and status. A captured or settled commission is separate from the vendor receiving a payout.|طابق العمولة مع طلبها ونسبتها وعملتها وحالتها. احتساب العمولة أو تسويتها يختلف عن استلام البائع دفعة مالية.
coupons|Check coupon eligibility|التحقق من أهلية الكوبون|Read the code, discount type, value, usage limits and schedule. Eligibility is recalculated when the customer applies it.|راجع الرمز ونوع الخصم وقيمته وحدود الاستخدام والجدول. يعاد فحص الأهلية عندما يطبق العميل الكوبون.
customers|Locate the correct customer|تحديد العميل الصحيح|This list is filtered to the demo customer. Verify account identity, active and blocked states before opening related purchases or addresses.|رشحت القائمة لعميل العرض. تحقق من الهوية وحالتي التفعيل والحظر قبل فتح المشتريات أو العناوين المرتبطة.
dashboards|Read the period before the figures|قراءة الفترة قبل الأرقام|Period metrics and current queues answer different questions. Choose the reporting period and read the generated time before comparing figures.|تجيب مؤشرات الفترة وقوائم المتابعة الحالية عن أسئلة مختلفة. حدد فترة التقرير واقرأ وقت التحديث قبل المقارنة.
flash-sales|Read the sale schedule|قراءة جدول التخفيض|Check the sale state and start/end times. Sale prices and allocated quantities belong to specific variants, not every option of a product.|راجع حالة التخفيض ووقت بدايته ونهايته. ترتبط الأسعار والكميات المخصصة بمتغيرات محددة لا بجميع خيارات المنتج.
gift-cards|Inspect value without exposing the code|فحص القيمة دون كشف الرمز|Read the masked reference, state, balance and currency. The full secret is never needed in a screenshot or support conversation.|راجع المرجع المخفي جزئياً والحالة والرصيد والعملة. لا يلزم عرض الرمز السري كاملاً في صورة أو محادثة دعم.
inventory|Match stock to a variant and location|مطابقة المخزون بالمتغير والموقع|On hand, reserved and available are different quantities. Match the SKU and location; scroll wide tables in the system to see the remaining columns.|الفعلي والمحجوز والمتاح كميات مختلفة. طابق رمز الصنف والموقع، ومرر الجدول العريض داخل النظام لرؤية بقية الأعمدة.
invoices|Distinguish the purchase document|تمييز مستند الشراء|Match invoice identity, state and currency. Open the purchase for vendor orders and item snapshots; a PDF that is not ready does not mean the invoice is missing.|طابق هوية الفاتورة وحالتها وعملتها. افتح الشراء للطلبات والأصناف؛ عدم جاهزية ملف PDF لا يعني غياب الفاتورة.
loyalty|Read points separately from money|قراءة النقاط بصورة منفصلة عن المال|Check the program or account state before interpreting points. Earning, reserved and available points follow program rules; a point count is not a cash balance.|راجع حالة البرنامج أو الحساب قبل تفسير النقاط. تتبع النقاط المكتسبة والمحجوزة والمتاحة قواعد البرنامج؛ عدد النقاط ليس رصيداً نقدياً.
notifications|Read your notification inbox|قراءة صندوق الإشعارات|Use the inbox for messages addressed to your account. An empty inbox means no matching messages are shown, not that orders or payments do not exist.|استخدم الصندوق للرسائل الموجهة إلى حسابك. فراغه يعني عدم عرض رسائل مطابقة، لا غياب الطلبات أو الدفعات.
orders|Separate order, payment and shipping states|فصل حالات الطلب والدفع والشحن|Match the order number and invoice, then read payment and shipment states independently. One purchase can contain several separately fulfilled vendor orders.|طابق رقم الطلب والفاتورة، ثم اقرأ حالتي الدفع والشحن بصورة مستقلة. قد يحتوي الشراء على طلبات بائعين تنفذ منفصلة.
payments|Read the recorded payment state|قراءة حالة الدفع المسجلة|Match the purchase, method, amount and recorded state. Awaiting confirmation, pending approval and paid require different next steps; a redirect is not payment proof.|طابق الشراء والطريقة والمبلغ والحالة المسجلة. لانتظار التأكيد والموافقة والدفع خطوات مختلفة؛ إعادة التوجيه ليست إثبات دفع.
pricing|Review price and quantity eligibility|مراجعة أهلية السعر والكمية|Read the price rule or list together with its currency, quantity threshold and buyer group. The server determines the eligible line amount.|راجع قاعدة السعر أو قائمته مع العملة وحد الكمية ومجموعة المشتري. يحدد الخادم قيمة البند المؤهلة.
products|Check identity and publication|التحقق من الهوية والنشر|Match the name, SKU, brand and state before opening a product. A saved parent product is separate from a purchasable, active and priced variant.|طابق الاسم ورمز الصنف والعلامة والحالة قبل فتح المنتج. يختلف المنتج الأب المحفوظ عن متغير نشط ومسعر وقابل للشراء.
promotions|Read rules before enabling a reward|قراءة القواعد قبل تفعيل المكافأة|Review type, priority, schedule, conditions and rewards. Lower priority numbers run first; the promotion type must be recognized by the pricing rules.|راجع النوع والأولوية والجدول والشروط والمكافآت. تنفذ أرقام الأولوية الأقل أولاً، ويجب أن تعرف قواعد التسعير نوع العرض.
refunds|Follow the financial refund|متابعة الاسترداد المالي|Match the order, amount, destination and state. A pending refund is not settled; return approval alone does not prove money was returned.|طابق الطلب والمبلغ والوجهة والحالة. الاسترداد المعلق غير مسوى؛ قبول الإرجاع وحده لا يثبت رد المال.
reports|Choose a generated reporting period|اختيار فترة تقرير مولدة|Select the report, period and dates together. Not ready or not generated can mean no matching snapshot; do not interpret it as zero business activity.|حدد التقرير والفترة والتواريخ معاً. قد تعني عدم الجاهزية غياب لقطة مطابقة؛ لا تفسرها بانعدام النشاط التجاري.
returns|Review the physical return process|مراجعة الإرجاع المادي|Match the return to its order and current stage. Receipt, inspection, restocking and financial refund are distinct decisions; use the next permitted action.|طابق الإرجاع مع طلبه ومرحلته. الاستلام والفحص وإعادة المخزون والاسترداد قرارات مستقلة؛ استخدم الإجراء التالي المسموح.
reviews|Read moderation and purchase verification|قراءة الإشراف والتحقق من الشراء|Rating, moderation state, verified purchase and reply state are separate facts. Check the product and author before responding or moderating.|التقييم وحالة الإشراف والتحقق من الشراء والرد حقائق مستقلة. تحقق من المنتج وصاحب المراجعة قبل الرد أو الإشراف.
search|Find and interpret discovery results|البحث وفهم نتائج الاكتشاف|Use the controls for the current discovery view. A search result, recommendation exclusion and search-log entry describe different stages of discovery.|استخدم أدوات شاشة الاكتشاف الحالية. تختلف نتيجة البحث واستبعاد التوصية وإدخال سجل البحث في معناها ومرحلتها.
seo|Check the source and destination path|التحقق من المسار الأصلي والوجهة|Review redirect source, destination, type and state. A permanent 301 and temporary 302 serve different purposes; confirm the intended destination before saving.|راجع الأصل والوجهة والنوع والحالة. يختلف غرض التحويل الدائم 301 عن المؤقت 302؛ تحقق من الوجهة المقصودة قبل الحفظ.
settings|Know who controls each setting|معرفة من يدير كل إعداد|Read editable fields and platform-controlled values separately. A displayed setting does not by itself prove a related workflow is enabled.|ميز الحقول القابلة للتعديل من القيم التي تديرها المنصة. عرض الإعداد لا يثبت وحده تفعيل سير العمل المرتبط.
settlements|Read the vendor statement|قراءة كشف البائع|Check statement period, currency, net amount and status. Gross sales, commission deductions and paid net are not interchangeable figures.|راجع فترة الكشف وعملته وصافيه وحالته. المبيعات الإجمالية وخصم العمولة وصافي المدفوع أرقام مختلفة.
shipping-providers|Check carrier capability and connection|فحص قدرات الناقل واتصاله|Read label/tracking support, connection state and credential status. Stored credentials do not prove a shipment or tracking event succeeded.|راجع دعم الملصقات والتتبع وحالة الاتصال والاعتماد. حفظ بيانات الاتصال لا يثبت نجاح شحنة أو حدث تتبع.
shipping|Read the parcel evidence|قراءة أدلة الطرد|Match the order, carrier, tracking reference and recorded events. A missing carrier or arrival time needs follow-up; it is not delivery confirmation.|طابق الطلب والناقل ومرجع التتبع والأحداث المسجلة. غياب الناقل أو موعد الوصول يستدعي المتابعة ولا يثبت التسليم.
storefront|Review what shoppers see|مراجعة ما يراه المتسوق|Storefront presentation combines branding, announcements, content and publication. Inspect the live page after permitted changes; display settings are separate from payment eligibility.|تجمع الواجهة الهوية والإعلانات والمحتوى والنشر. افحص الصفحة بعد التعديلات المخولة؛ تختلف إعدادات العرض عن أهلية الدفع.
support|Follow the ticket conversation|متابعة محادثة التذكرة|Read subject, priority, state and replies together. A resolved support ticket is not proof of a payment, refund or shipment action.|اقرأ الموضوع والأولوية والحالة والردود معاً. حل التذكرة لا يثبت تنفيذ دفع أو استرداد أو شحن.
tax-currency|Read configured rates and currency|قراءة النسب والعملات المضبوطة|Check code, country, rate and active state. These are demo configuration values; interpret purchase amounts in their recorded currency.|راجع الرمز والدولة والنسبة وحالة التفعيل. هذه قيم إعداد تجريبية؛ اقرأ مبالغ الشراء بعملتها المسجلة.
team|Separate staff from customers|فصل الموظفين عن العملاء|Read each staff member’s role and active/blocked state. Staff permissions govern dashboard actions; customer groups do not grant these permissions.|راجع دور الموظف وحالتي التفعيل والحظر. تحكم صلاحيات الموظفين إجراءات اللوحة، ولا تمنحها مجموعات العملاء.
tenants|Check the business context|التحقق من سياق النشاط|Confirm the tenant identity or store code before reviewing records. Branches belong to their store; they are not separate vendor workspaces.|تحقق من هوية المتجر أو رمزه قبل مراجعة السجلات. تتبع الفروع متجرها ولا تشكل مساحات عمل مستقلة للبائع.
vendor-profile|Maintain the vendor identity|إدارة هوية البائع|Profile, addresses, documents and payout accounts are separate tabs. Updating public profile text does not approve a document or verify a payout account.|للملف والعناوين والمستندات وحسابات الصرف تبويبات مستقلة. تعديل النص العام لا يعتمد مستنداً ولا يتحقق من حساب صرف.
vendors|Check approval and workspace|التحقق من الاعتماد ومساحة العمل|A vendor organization and an approved tenant-vendor link are different records. Confirm the active workspace before interpreting products, commission or orders.|تختلف مؤسسة البائع عن رابط اعتمادها في المتجر. تحقق من مساحة العمل النشطة قبل تفسير المنتجات أو العمولات أو الطلبات.
wallet|Separate posted, held and available credit|فصل الرصيد الدفتري والمحجوز والمتاح|Read available credit and its ledger, not just the total. Holds reserve value; gift-card claims and refunds require their own recorded transactions.|اقرأ الرصيد المتاح وسجله لا الإجمالي وحده. تحجز العمليات المعلقة قيمة؛ تتطلب مطالبات البطاقات والاستردادات معاملات مسجلة مستقلة.
webhooks|Inspect delivery state separately|فحص حالة التسليم بصورة مستقلة|Match endpoint, event subscriptions, registration state and delivery history. An active registration is not evidence that the receiving system accepted an event.|طابق الوجهة واشتراكات الأحداث وحالة التسجيل وسجل التسليم. تفعيل التسجيل لا يثبت قبول النظام المستلم للحدث.
wishlist|Keep a variant for later|حفظ متغير لوقت لاحق|Saved variants do not reserve stock or freeze a price. Opening the page refreshes the saved list; reopen the product and check its current price before buying.|لا يحجز حفظ المتغير مخزوناً ولا يثبت سعراً. يحدث فتح الصفحة قائمة الحفظ؛ افتح المنتج وراجع سعره الحالي قبل الشراء.'''
copy={}
for line in COPY.splitlines():
 key,title,artitle,en,ar=line.split('|');copy[key]=(title,artitle,en,ar)
roles={'admin':('Platform admin','إدارة المنصة'),'tenant':('Tenant operator','إدارة المتجر'),'vendor':('Vendor workspace','مساحة البائع'),'customer':('Customer','العميل')}
overrides={
 ('admin','orders'):('Platform oversight is read-only. Match the order to its invoice, tenant and vendor, then inspect payment and shipping states separately.','رقابة طلبات المنصة للقراءة فقط. طابق الطلب مع الفاتورة والمتجر والبائع، ثم افحص حالتي الدفع والشحن منفصلتين.'),
 ('admin','reports'):('Choose a report category here, then a generated period. Report snapshots run on a schedule; this page is the report directory, not a revenue result.','اختر فئة التقرير هنا ثم فترة مولدة. تجهز لقطات التقارير بجدول؛ هذه الصفحة فهرس التقارير لا نتيجة إيراد.'),
 ('admin','loyalty'):('Outstanding and reserved point counts are liabilities in points, not money. Compare the tenant rows without inventing a points-to-currency conversion.','تمثل أعداد النقاط القائمة والمحجوزة التزامات بالنقاط لا بالمال. قارن صفوف المتاجر دون افتراض سعر تحويل نقدي.'),
 ('admin','gift-cards'):('Read outstanding card balances by tenant and currency. Do not add amounts from different currencies into one total.','اقرأ أرصدة البطاقات القائمة حسب المتجر والعملة. لا تجمع مبالغ العملات المختلفة في إجمالي واحد.'),
 ('admin','notifications'):('This overview covers in-app notifications only. Its queued, delivered and read counts do not include email, SMS or push delivery.','تغطي هذه النظرة الإشعارات الداخلية فقط. لا تشمل أعداد الانتظار والتسليم والقراءة البريد أو الرسائل النصية أو الإشعارات الدفعية.'),
 ('admin','search'):('The top queries summarize the rows on this page only. Use zero-result filters to investigate; the ranking is not platform-wide demand.','تلخص الاستعلامات الأعلى صفوف هذه الصفحة فقط. استخدم مرشح النتائج الصفرية للتحقيق؛ الترتيب ليس طلباً على مستوى المنصة.'),
 ('admin','storefront'):('Select a tenant before reading its storefront configuration. The platform view is read-only; tenant operators maintain the editable storefront settings.','اختر المتجر قبل قراءة إعدادات واجهته. عرض المنصة للقراءة فقط؛ تدير إدارة المتجر إعدادات الواجهة القابلة للتعديل.'),
 ('tenant','search'):('Recommendations has exclusions, pinned pairs and rail performance. An exclusion removes a product from the chosen rail; it does not unpublish the product.','للتوصيات استبعادات وأزواج مثبتة وأداء مسارات. يزيل الاستبعاد المنتج من المسار المختار ولا يلغي نشره.'),
 ('tenant','loyalty'):('The demo program is active but has no live rule version. Review rule versions before promising earning or redemption; program state alone is insufficient.','البرنامج التجريبي نشط لكنه بلا إصدار قواعد مباشر. راجع الإصدارات قبل الوعد بالاكتساب أو الاستبدال؛ حالة البرنامج وحدها غير كافية.'),
 ('vendor','invoices'):('Your total is the vendor share shown in this workspace. It can differ from the full purchase invoice paid by the customer.','إجماليك هو حصة البائع في مساحة العمل هذه. قد يختلف عن فاتورة الشراء الكاملة التي يدفعها العميل.'),
 ('vendor','access'):('Account settings exposes password-change and account-removal controls. This capture uses empty password fields; no credential or account change was submitted.','تعرض إعدادات الحساب تغيير كلمة المرور وإزالة الحساب. الحقول فارغة في الصورة؛ لم يرسل تعديل اعتماد أو حساب.'),
 ('customer','cms'):('The Journal presents storefront stories. Published editorial content is separate from purchase terms, invoice state and order tracking.','يعرض الجورنال قصص المتجر. يختلف المحتوى التحريري المنشور عن شروط الشراء وحالة الفاتورة وتتبع الطلب.'),
 ('customer','dashboards'):('Use account shortcuts for invoices, wallet, points and support. Follow the latest purchase and its parcel history rather than relying on a summary count alone.','استخدم اختصارات الحساب للفواتير والمحفظة والنقاط والدعم. تابع الشراء الأخير وسجل طرده بدلاً من الاعتماد على عداد ملخص فقط.'),
 ('customer','tenants'):('Branches lists pickup locations. This demo currently renders some address text incorrectly; confirm pickup details with the store before relying on the address.','تعرض الفروع مواقع الاستلام. تعرض البيئة التجريبية بعض نصوص العناوين بصورة غير صحيحة؛ أكد تفاصيل الاستلام مع المتجر قبل الاعتماد على العنوان.'),
 ('customer','products'):('Read the chosen SKU, current price and availability before adding a variant. Delivery and points text are estimates, not proof of fulfillment or earned credit.','اقرأ رمز الخيار وسعره الحالي وتوافره قبل الإضافة. نصوص التوصيل والنقاط تقديرات لا تثبت التنفيذ أو اكتساب رصيد.'),
}
supplemental={
 'customer-screen-help-centre.jpg':('Help centre','مركز المساعدة','Choose a category and expand a question. Guests can read help; a personal support ticket requires sign-in.','اختر التصنيف وافتح السؤال. يمكن للضيف قراءة المساعدة، وتتطلب التذكرة الشخصية الدخول.'),
 'customer-screen-faq-answer.jpg':('Read an answer','قراءة إجابة','Expand a question to read the published answer. Store configuration and the actual purchase state govern available payment, return and refund actions.','افتح السؤال لقراءة الإجابة المنشورة. تحكم إعدادات المتجر وحالة الشراء إجراءات الدفع والإرجاع والاسترداد المتاحة.'),
 'customer-screen-vendor-detail.jpg':('Seller page','صفحة البائع','Read the seller description and products before choosing an item. Public contact or address information is separate from the delivery quote for your purchase.','اقرأ وصف البائع ومنتجاته قبل الاختيار. تختلف معلومات العنوان أو التواصل العامة عن عرض توصيل مشترياتك.'),
 'customer-screen-brand-filter.jpg':('Filter brands by letter','تصفية العلامات بالحرف','Select an available A–Z letter; select it again or Clear to reset. Open a brand tile for matching Shop results.','اختر حرفاً متاحاً من A–Z، ثم اضغطه مجدداً أو امسح الفلتر للعودة. افتح بطاقة العلامة لنتائج التسوق المطابقة.'),
 'tenant-screen-payment-method-form.jpg':('Payment-method setup','إعداد طريقة الدفع','Provider, customer label and display order are separate fields. Credentials are write-only and replaceable; this blank form was not saved.','المزود واسم العرض وترتيبه حقول مستقلة. بيانات الاعتماد للكتابة والاستبدال فقط؛ لم يحفظ هذا النموذج الفارغ.'),
 'tenant-screen-promotion-form.jpg':('Promotion builder','منشئ العرض','Set recognized type and priority, then the schedule, rules and rewards. All rules must match. This blank form demonstrates the layout without creating a promotion.','اضبط النوع المعروف والأولوية ثم الجدول والقواعد والمكافآت. يجب تطابق جميع القواعد. يعرض النموذج الفارغ التصميم دون إنشاء عرض.'),
 'tenant-screen-reference-tags.jpg':('Read-only reference tags','وسوم مرجعية للقراءة فقط','These platform-maintained tags are reference data. Only active tags are returned; the store cannot edit or retire them from this view.','هذه الوسوم بيانات مرجعية تديرها المنصة. تعرض النشطة فقط، ولا يمكن للمتجر تعديلها أو إيقافها من هذه الشاشة.')
}
coverage=[]
for feature,(title,artitle,en,ar) in copy.items():
 items=[c for c in captures if c['feature']==feature]
 items.sort(key=lambda c:(list(roles).index(c['role']),c.get('supplemental',False)))
 steps=[]
 for c in items:
  role=c['role'];body,bodyar=overrides.get((role,feature),(en,ar));label,arlabel=roles[role]
  if c['file'] in supplemental:label,arlabel,body,bodyar=supplemental[c['file']]
  elif role=='vendor' and feature not in ['access','settings','brands','categories','tax-currency','support']:body='Check the workspace. '+body;bodyar='تحقق من مساحة العمل. '+bodyar
  focus=[22,22,74,70] if role!='customer' else [3,16,93,77]
  if c['file']=='vendor-screen-team.jpg':focus=[22,35,74,60]
  steps.append(dict(image=c['file'],focus=focus,title=dict(en=label,ar=arlabel),body=dict(en=body,ar=bodyar),guide='features/'+feature))
 assert steps,feature
 tours['feature-'+feature]=dict(title=dict(en=title,ar=artitle),intro=dict(en='Choose your dashboard below. The explanation and screen change together.',ar='اختر لوحتك أدناه ليتغير الشرح والشاشة معاً.'),video=True,secondsPerStep=12,provenance=dict(en='Demo data · 17 November 2026 · Deployed admin, tenant and vendor dashboards; local customer frontend; demo API · Observed states, not completed transactions',ar='بيانات تجريبية · 17 نوفمبر 2026 · لوحات المنصة والمتجر والبائع المنشورة وواجهة العميل المحلية مع بيانات العرض · حالات مشاهدة وليست معاملات مكتملة'),steps=steps)
 coverage.append(dict(feature=feature,roles=sorted({c['role'] for c in items}),screens=[c['file'] for c in items],tour='feature-'+feature))
 for lang in ['en','ar']:
  p=R/'content/docs'/lang/'features'/f'{feature}.mdx';s=p.read_text(encoding='utf-8')
  # Keep precise task walkthroughs available without doubling every article's visual length.
  old=re.findall(r'<SystemTour[^>]+/>',s)
  if f'tour="feature-{feature}"' not in s:
   s=re.sub(r'<SystemTour[^>]+/>\s*','',s)
   anchor='## القيود والقرارات' if lang=='ar' else '## Restrictions and decisions'
   block=f'<SystemTour tour="feature-{feature}" compact />\n\n'
   if old:
    label='جولة تفصيلية للخطوات' if lang=='ar' else 'Detailed task walkthrough'
    block+=f'<details className="guide-task-details">\n<summary>{label}</summary>\n\n'+old[0]+'\n\n</details>\n\n'
   s=s.replace(anchor,block+anchor)
  p.write_text(s,encoding='utf-8')
(R/'content/system-tours.json').write_text(json.dumps(tours,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(R/'evidence/visual-coverage.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# Refresh earlier shared screenshot filenames from current equivalent screens.
for old,new in {'admin-dashboard.jpg':'admin-screen-dashboards.jpg','admin-orders.jpg':'admin-screen-orders.jpg','tenant-dashboard.jpg':'tenant-screen-dashboards.jpg','tenant-products.jpg':'tenant-screen-products.jpg','vendor-dashboard.jpg':'vendor-screen-dashboards.jpg','customer-account-overview.jpg':'customer-screen-dashboards.jpg','customer-invoice-detail.jpg':'customer-screen-invoices.jpg'}.items():
 shutil.copyfile(R/'public/screenshots'/new,R/'public/screenshots'/old)
sizes={}
for p in sorted((R/'public/screenshots').glob('*.jpg')):
 with Image.open(p) as i:sizes[p.name]=dict(width=i.width,height=i.height)
(R/'content/screenshot-sizes.json').write_text(json.dumps(sizes,indent=2)+'\n',encoding='utf-8')
print(f'Attached {len(coverage)} bilingual feature tours from {len(captures)} reviewed captures.')
library=[]
for entry in coverage:
 item=dict(id=entry['feature'],roles=[role.upper() for role in entry['roles']],screens=len(entry['screens']),title={},description={})
 for lang in ['en','ar']:
  text=(R/'content/docs'/lang/'features'/(entry['feature']+'.mdx')).read_text(encoding='utf-8')
  for field in ['title','description']:
   item[field][lang]=json.loads(re.search(r'^'+field+r': (.+)$',text,re.M).group(1))
 library.append(item)
(R/'content/feature-library.json').write_text(json.dumps(library,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
