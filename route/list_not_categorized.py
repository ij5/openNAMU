from .tool.func import *

def list_not_categorized():
    with get_db_connect() as conn:
        curs = conn.cursor()

        curs.execute(db_change('select data from other where name = "count_all_title"'))
        if int(curs.fetchall()[0][0]) > 30000:
            return re_error('/error/25')

        div = '<ul class="opennamu_ul">'

        curs.execute(db_change('SELECT DISTINCT title FROM history WHERE title NOT LIKE "category:%" AND title NOT IN (SELECT link FROM back WHERE type = "cat") limit 50'))
        for data in curs.fetchall():
            if not data[0]:
                continue
            div += '<li>' + '<a href="/w/' + url_pas(data[0]) + '">' + html.escape(data[0]) + '</a></li>'

        div += '</ul>'

        return easy_minify(flask.render_template(skin_check(),
            imp = [load_lang('not_categorized'), wiki_set(), wiki_custom(), wiki_css([0, 0])],
            data = div,
            menu = [['other', load_lang('return')]]
        ))