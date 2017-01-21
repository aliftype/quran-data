import glob
import os
import subprocess

for text_filename in glob.glob("../quran/???.txt"):
  base_filename = os.path.basename(text_filename)
  json_filename = os.path.splitext(base_filename)[0] + ".json"
  print("Generating %s ⇒ %s" % (text_filename, json_filename))
  proc = subprocess.run(["hb-shape",
                         "--font-file=amiri-quran.ttf",
                         "--text-file=%s" % text_filename,
                         "--output-format=json",
                         "--cluster-level=1"],
                        check=True, stdout=subprocess.PIPE)
  json_file = open(json_filename, "w")
  for line in proc.stdout.split():
      json_file.write(line.decode("ascii"))
      json_file.write("\n")
