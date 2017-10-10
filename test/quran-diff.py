#!/usr/bin/env python

import json
import jsondiff
import os
import subprocess
import sys


def diffaya(txt, old, new):
    diff = jsondiff.diff(old, new)

    indices = set()
    words = set()

    for key, value in diff.items():
        if not isinstance(key, int):
            print(key, value)
            continue
        indices.add(old[key]["cl"])

    for index in indices:
        start = end = index
        while start >= 0 and not txt[start].isspace():
            start -= 1
        while end < len(txt) and not txt[end].isspace():
            end += 1
        words.add(txt[start+1:end])

    return words

def run(cmd):
    cmd = cmd.split(" ")
    proc = subprocess.run(cmd, check=True, stdout=subprocess.PIPE)
    out = proc.stdout.decode("utf-8")
    return out

if __name__ == "__main__":
    words = set()
    root = run("git rev-parse --show-toplevel").strip()
    for path in run("git diff --name-only HEAD").split("\n"):
        if not path or not path.endswith(".json"):
            continue
        aya = os.path.splitext(os.path.basename(path))[0]
        sura = os.path.basename(os.path.dirname(path))
        print("Comparing %s:%s" % (aya, sura))
        old = json.load(open(os.path.join(root, path)))
        new = json.loads(run("git show HEAD:%s" % path))
        with open("../quran/%s.txt" % sura) as surafile:
            txt = surafile.readlines()[int(aya)]
            words.update(diffaya(txt, old, new))

    with open("diff.html", "w") as htmlfile:
        out = []
        out.append("<html>")
        out.append("<head>")
        out.append("<meta charset='utf-8'/>")
        out.append("<style>")
        out.append("@font-face { font-family: Quran; src: url('amiri-quran.ttf'); }")
        out.append("p { font-family: Quran; }")
        out.append("</style>")
        out.append("</head>")
        out.append("<body>")
        for word in sorted(words):
            out.append("<p>%s</p>" % word)
        out.append("</body>")
        out.append("</html>")
        htmlfile.write("\n".join(out))
