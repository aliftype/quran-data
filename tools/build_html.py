import sys
from os import path
from jinja2 import Template

htmlTemplate = Template("""<html>
  <head>
    <meta charset="utf-8"/>
    <style>
    body {
      direction: rtl;
      text-align: justify;
      width: 18em;
      margin: auto;
      font-family: Amiri Quran Colored;
      font-size: 16pt;
    }
    .basmala {
      font-size: 18pt;
      text-align: center;
    }
    </style>
  </head>
  <body>
    {%- if basmala %}
    <p class="basmala">&#xfdfd;</p>
    {% endif -%}
    <p>
    {{text}}
    </p>
  </body>
</html>
""")

def buildPage(textfile):
    text = textfile.read().strip()
    text = text.replace(" \u06dd", "\u00a0\u06dd")
    num = int(path.splitext(path.basename(textfile.name))[0])
    basmala = num not in (1, 9)
    html = htmlTemplate.render(text=text, basmala=basmala)

    return html

def main():
    filenames = sys.argv[1:]
    for filename in filenames:
        with open(filename, "r") as textfile:
            html = buildPage(textfile)
            with open(filename.replace(".txt", ".html"), "w") as htmlfile:
                htmlfile.write(html)

if __name__ == "__main__":
    main()
