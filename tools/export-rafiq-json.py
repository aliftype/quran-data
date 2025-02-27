BASMALA = "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ"
SAJDA = "۩"


def process_file(file_path):
    try:
        sura = int(file_path.stem)
    except ValueError:
        raise ValueError(f"Invalid file name: {file_path.name}")

    ayahs = []
    with file_path.open() as f:
        for ayah in f.readlines():
            ayah, rest = ayah.split("\u06dd")
            ayah = ayah.strip()
            if SAJDA in rest:
                ayah += " " + SAJDA
            ayahs.append(ayah)

    if sura not in [1, 9]:
        ayahs[0] = BASMALA + " " + ayahs[0]

    return ayahs


def main():
    import argparse
    import json
    import pathlib

    parser = argparse.ArgumentParser(description="Export Rafiq JSON")
    parser.add_argument(
        "data",
        help="Input Quran data files",
        type=pathlib.Path,
        nargs="+",
    )
    parser.add_argument(
        "-t",
        "--template",
        help="Template JSON file",
        type=pathlib.Path,
        required=True,
    )
    parser.add_argument(
        "-o",
        "--output",
        help="Output JSON file",
        type=pathlib.Path,
        required=True,
    )

    args = parser.parse_args()

    data = []
    for path in args.data:
        data.extend(process_file(path))

    assert len(data) == 6236

    with args.template.open() as f:
        template = json.load(f)

    for page in template.values():
        for ayah in page["ayahs"]:
            ayah["text"] = data[ayah["number"] - 1]

    with args.output.open("w") as f:
        json.dump(template, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
