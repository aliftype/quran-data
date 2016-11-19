for text in ../quran/???.txt; do
  json=$(basename $text .txt).json
  echo "Generating $text ⇒ $json";
  hb-shape \
    --font-file=amiri-quran.ttf \
    --text-file=$text \
    --output-file=$json \
    --output-format=json \
    --cluster-level=1
done
