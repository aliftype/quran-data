#!/usr/bin/env python

import json
import glob
import os
import subprocess

for text_filename in sorted(glob.glob("../quran/???.txt")):
  base_filename = os.path.basename(text_filename)
  json_dirname = os.path.splitext(base_filename)[0]
  print("Generating %s ⇒ %s" % (text_filename, json_dirname))
  proc = subprocess.run(["hb-shape",
                         "--font-file=amiri-quran.ttf",
                         "--text-file=%s" % text_filename,
                         "--output-format=json",
                         "--cluster-level=1"],
                        check=True, stdout=subprocess.PIPE)
  os.makedirs(json_dirname, exist_ok=True)
  for i, line in enumerate(proc.stdout.split()):
    with open(json_dirname + "/%03d.json" % i, "w") as json_file:
      json_file.write(line.decode("utf-8"))
