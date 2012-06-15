CC = gcc
LCFLAGS = -I.
CFLAGS = $(shell pkg-config --cflags gtk+-3.0 webkitgtk-3.0 glib-2.0)
LIBS = $(shell pkg-config --libs gtk+-3.0 webkitgtk-3.0 glib-2.0)
OUT = session-launch
SRC = main.c

all:
	$(CC) -Wall $(SRC) $(CFLAGS) $(LCFLAGS) -o $(OUT) $(LIBS)

clean:
	rm -f session-launc
	rm -f *.o
	rm -f Makefile.bak
