package main

import (
    "log"
    "net/http"
	"html/template"
	"fmt"	
	"os/exec"
	"strings"
	"encoding/json"
)

type Item struct {
	Alt float32
	Azm float32
	Mag float32
}

type Res struct {
	Stars string
	Message string
}

var templates = make(map[string]*template.Template)

func main() {
	templates["world.html"] = template.Must(template.ParseFiles("templ/layout.html", "templ/world.html"))

	
	http.Handle("/public/", http.StripPrefix("/public/", http.FileServer(http.Dir("public"))))
	
	http.HandleFunc("/", showWorld)
	http.HandleFunc("/constellation", getConstellation)
	http.HandleFunc("/stars", getStars)
	
	port := "8080"
    log.Fatal(http.ListenAndServe(":" + port, nil))
}

func sendError(mes string, w http.ResponseWriter){
		res := Res{}
		res.Stars = "[]"
		res.Message = mes
		jsonToSend, err := json.Marshal(res)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println(string(jsonToSend))
		fmt.Fprintln(w, string(jsonToSend))
		return
}

func showWorld(w http.ResponseWriter, r *http.Request) {
	err := templates["world.html"].ExecuteTemplate(w, "layout", nil)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func getConstellation(w http.ResponseWriter, r *http.Request) {
	keys, ok := r.URL.Query()["const"]
    
    if !ok || len(keys[0]) < 1 {
		sendError("Constellation is missing", w)
		return
    }
	key := string(keys[0])
	cmd := exec.Command("python", "scripts/const.py", strings.ToLower(key))
	out, err := cmd.Output()

	if err != nil {
		sendError(string(err.Error()), w)
		return
	}
	
	fmt.Fprintln(w, string(out))
}

func getStars(w http.ResponseWriter, r *http.Request) {
	cmd := exec.Command("python", "scripts/stars.py")
	out, err := cmd.Output()

	if err != nil {
		sendError(string(err.Error()), w)
		return
	}
	fmt.Fprintln(w, string(out))
}