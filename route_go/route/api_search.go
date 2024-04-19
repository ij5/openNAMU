package route

import (
	"encoding/json"
	"log"
	"strconv"

	"opennamu/route/tool"
)

func Api_search(call_arg []string) string {
	db_set := map[string]string{}
	json.Unmarshal([]byte(call_arg[0]), &db_set)

	other_set := map[string]string{}
	json.Unmarshal([]byte(call_arg[1]), &other_set)

	page, _ := strconv.Atoi(other_set["num"])
	num := 0
	if page*50 > 0 {
		num = page*50 - 50
	}

	db := tool.DB_connect(db_set)
	defer db.Close()

	if other_set["search_type"] == "title" {
		stmt, err := db.Prepare(tool.DB_change(db_set, "select title from data where title collate nocase like ? order by title limit ?, 50"))
		if err != nil {
			log.Fatal(err)
		}
		defer stmt.Close()

		var title string
		var title_list []string

		rows, err := stmt.Query("%"+other_set["name"]+"%", num)
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()

		for rows.Next() {
			err := rows.Scan(&title)
			if err != nil {
				log.Fatal(err)
			}

			title_list = append(title_list, title)
		}

		if len(title_list) == 0 {
			return "{}"
		} else {
			json_data, _ := json.Marshal(title_list)
			return string(json_data)
		}
	} else {
		stmt, err := db.Prepare(tool.DB_change(db_set, "select title from data where data collate nocase like ? order by title limit ?, 50"))
		if err != nil {
			log.Fatal(err)
		}
		defer stmt.Close()

		var title string
		var title_list []string

		rows, err := stmt.Query("%"+other_set["name"]+"%", num)
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()

		for rows.Next() {
			err := rows.Scan(&title)
			if err != nil {
				log.Fatal(err)
			}

			title_list = append(title_list, title)
		}

		if len(title_list) == 0 {
			return "{}"
		} else {
			json_data, _ := json.Marshal(title_list)
			return string(json_data)
		}
	}
}
