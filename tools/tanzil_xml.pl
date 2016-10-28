#!/usr/bin/perl
use strict; use warnings; use utf8;
open OUT,">:utf8", "tanzil.xml" or die $!;
my $src="quran";

open META, "<:utf8", "$src/meta.txt" or die $!;
my @suras = (undef); # One-indexed
while (<META>) {
  chomp;
  my ($name, $place, $bm) = split /\t/, $_;
  push @suras, {name => $name, place => $place, bismillah => !(defined $bm) };
}

print OUT <<EOT;
<?xml version="1.0" encoding="utf-8" ?>
<quran>
EOT

my $sura=1;
my $basmala;

while (<$src/???.txt>) {
  open my $in, "<:utf8", $_ or die $!;
  my $meta = $suras[$sura];
  print OUT qq{<sura index="$sura" name="$meta->{name}" place="$meta->{place}">\n};
  while (<$in>) {
    chomp;
    if (!$basmala) {$basmala = $_; $basmala =~ s/\s*۝.+\s*//; }
    if ($. == 1 and $meta->{bismillah}) { # No bismillah
      print OUT qq{<aya index="$." text="$_" bismillah="$basmala"/>\n};
    } else {
      print OUT qq{<aya index="$." text="$_" />\n};
    }
  }
  $sura++;
  print OUT qq{</sura>\n};
}
print OUT qq{</quran>\n};
