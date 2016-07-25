import sys
import glob
from os import path
from jinja2 import Template

htmlTemplate = Template("""<html>
  <head>
    <meta charset="utf-8"/>
    <title>{{name}}</title>
    <style>
    body {
      direction: rtl;
      text-align: justify;
      text-align-last: center;
      -moz-text-align-last: center;
      width: 18em;
      margin: auto;
      font-family: Amiri Quran Colored;
      font-size: 16pt;
    }
    .basmala {
      font-size: 18pt;
      text-align: center;
    }
    .sura-name {
      font-family: Reem Kufi;
      font-size: 24pt;
      font-feature-settings: "cv01";
      text-align: center;
    }
    </style>
  </head>
  <body>
    <div class="sura-name">
    سورة {{name}}\t{{place}}
    </div>
    {%- if basmala %}
    <p class="basmala">&#xfdfd;</p>
    {% endif -%}
    <p>
    {{text}}
    </p>
  </body>
</html>
""")

def BuildPage(textfile, metadata):
    text = textfile.read().strip()
    text = text.replace(" \u06dd", "\u00a0\u06dd")
    text = text.replace(" \u06e9", "\u00a0\u06e9")
    num = int(path.splitext(path.basename(textfile.name))[0])
    name, place, basmala = metadata[num]
    html = htmlTemplate.render(text=text, name=name, place=place, basmala=basmala)

    return html

def ReadMetadata(filename):
    metadata = {}
    with open(filename) as metafile:
        lines = [l.strip().split("\t") for l in metafile.readlines()]
        for num, line in enumerate(lines):
            num = num + 1
            metadata[num] = [line[0], line[1], True]
            if len(line) == 3:
                metadata[num][2] = False
    return metadata

def main():
    dirname = sys.argv[1]
    filenames = glob.glob(dirname + "/???.txt")
    metadata = ReadMetadata(dirname + "/meta.txt")
    for filename in filenames:
        with open(filename, "r") as textfile:
            html = BuildPage(textfile, metadata)
            with open(filename.replace(".txt", ".html"), "w") as htmlfile:
                htmlfile.write(html)

if __name__ == "__main__":
    main()
