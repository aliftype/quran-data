يحتوي هذا المستودع على القرآن في ملفات نصية صِرفة بترميز يونيكود متبعا أفضل
ممارسات استخدام يونيكود قدر الإمكان (لا حيل خاصة بخط معين، و لا إعادة استخدام نقاط
ترميز في غير ما وضعت له، إلى غير ذلك)، بالإضافة إلى بعض الأدوات لتحويله إلا أنساق
أخرى.

بعد العلامات المستخدمة في هذا النص أضيفت إلى يونيكود في إصدارتها ٦٫١ لذا قد تظهر
مشكلات في عرض هذا النص في البرمجيات القديمة أو التي لم تُحدّث إلى آخر إصدارات من
يونيكود.

**لم يدقق هذا النص رسميًا بعد، و قد يحتوي على أخطاء، فالرجاء الإبلاغ عن أي أخطاء
تُكتشف.**

يظهر النص حاليا أنسب ما يكون مع خط [أميري قرآن][Amiri Quran]، إذ يحتوي على كل
العلامات المطلوبة و قواعد تنضيدها الصحيحة.

يعتمد هذه النص (و خط أميري قرآن) رسم مصحف الأزهر (المعروف أحيانًا بالمصحف الأميري،
أو مصحف مصلحة المساحة، أو مصحف الحفاظ، أو مصحف الاثني عشر سطرًا) في طبعته الرابعة
المطبوعة عام ١٣٨٨ ه‍.

This repository contains the Quran as UTF-8 encoded plain text files, following
best Unicode practices as much possible (no more font specific hacks, no repurposing
of totally unrelated code points and so on), plus some tools to convert it
into other document formats.

Some of the symbols used in this text were introduced in Unicode 6.1, so old
applications or applications that haven’t been updated to Unicode 6.1 or newer
might have issues displaying this text.

**The text has not been formally reviewed yet, so it may contain some errors.
If you find any, please report them.**

Currently the text is best viewed using the [Amiri Quran] font, as it has all the
needed symbols and layout rules.

## Variations from Tanzil's Text
- Add ayah numbers and End of Ayah (U+06DD) mark (note that most fonts do not properly join the two).
- Use regular Hamzah (U+0621) instead of Tatweel & Hamzah Above combination (U+0640 & U+0654).
- Use U+06CC (Farsi Yeh) for all Yaa' positions, instead of U+064A (Arabic Yeh) for starting and middle, and U+0649 (Alef Maksura) for final and isolated.
- Use open Tanween (U+08F0, U+08F1, U+08F2) in ikhfaa' and idghaam cases, instead of regular Tanween (U+064B, U+064C, U+064D).
- Don't use Tanween before U+06E2 (Small High Meem) (i.e., in iqlaab cases).
- Use U+06E1 (Small High Dotless Head Of Khah) instead of U+0652 (Sukun).
- Use U+06E4 (Small High Madda) instead of U+0653 (Maddah Above).
- No spaces before pause marks.
- Variation in the use and location of spaces (some removed; some added).
- Variation in the use and location of pause marks (some removed; some added; as they are, in the end, simply indicators).

[Amiri Quran]: http://www.amirifont.org
