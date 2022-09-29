import re
import sys

MARKS = "[\u064B-\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u08CA-\u08E1\u08E3-\u08FF]*"
JOINERS = "[بتثجحخسشصضطظعغفقكلمنهىیـ]"
NONJOINERS = "[بتثجحخسشصضطظعغفقكلمنهىیـاأآإدذرزوؤ\u0671ة]"

RE = re.compile(JOINERS + MARKS + "(ء)" + MARKS + NONJOINERS)


# "ـ\u0654"
def repl(m):
    print(m.group(1))
    return m.string[m.start() : m.end()].replace(m.group(1), "ـ\u0654")


for path in sys.argv[1:]:
    with open(path) as f:
        text = f.read()
    text = RE.sub(repl, text)
    with open(path, "w") as f:
        f.write(text)
