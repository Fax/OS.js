#include <gtk/gtk.h>
#include <webkit/webkit.h>
#include <X11/Xlib.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifndef NOX11
Display *d;

void
initialize_x11()
{
  d = XOpenDisplay(NULL);
  if (d == NULL) {
    fprintf(stderr, "Cannot open display\n");
    exit(1);
  }
}
#endif

int
main (int argc, gchar *argv[])
{
#ifndef NOX11

  initialize_x11();

#endif

  char          *uri = "http://OSjs.local";

  // Initialize GTK+
  if ( !g_thread_supported() )
    g_thread_init (NULL);

  gtk_init_check (&argc, &argv);

  // Create WebKit view
  WebKitWebView *web_view;
  web_view = WEBKIT_WEB_VIEW (webkit_web_view_new ());
  webkit_web_view_load_uri (web_view, uri);

  // Create Window
  GtkWidget     *window;
  window = gtk_window_new (GTK_WINDOW_TOPLEVEL);
  g_signal_connect (window, "destroy", G_CALLBACK (gtk_main_quit), NULL);

  gtk_container_add (GTK_CONTAINER (window), GTK_WIDGET(web_view));

  // Run
  gtk_widget_show_all (window);
  gtk_window_fullscreen (GTK_WINDOW(window));

  gtk_main();

#ifndef NOX11

  XCloseDisplay(d);

#endif

  return 0;
}
