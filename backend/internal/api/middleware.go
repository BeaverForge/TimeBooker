package api

import "net/http"

/*
	HandleCors is a middleware function that adds CORS headers to the HTTP response. 
	It allows requests from "http://localhost:5173" and supports GET, POST, PUT, and OPTIONS methods. 
	It also handles preflight OPTIONS requests by returning a 204 No Content status code without further 
	processing the request.	

	Only needed for dev server .Not 
*/
func HandleCors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
