OUTFILE=build/quickhac.zip
INCLUDE_PATTERNS=\*.js \*.css \*.html \*.json \*.jpg \*.png \*.svg \*.ttf
INCLUDE_DIR=* assets/* lib/*

all:
	zip ${OUTFILE} ${INCLUDE_DIR} -i ${INCLUDE_PATTERNS}

clean:
	rm ${OUTFILE}