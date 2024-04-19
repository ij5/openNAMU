"use strict";

let doubleclick = false;

const postprocessing = ()=>{
    let tooltip = document.createElement('span');
    tooltip.classList.add('tooltip');
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);

    const rfns = document.getElementsByClassName('rfn')
    document.addEventListener('click', (ev)=>{
        if(!ev.target.id.includes('rfn') && tooltip.style.display !== 'none'){
            tooltip.style.display = 'none';
            doubleclick = false;
        }
    })
    for(let i = 0; i < rfns.length; i++) {
        rfns[i].children[0].addEventListener('click', (ev)=>{
            ev.preventDefault();
            ev.stopPropagation();
            let dref = rfns[i].children[0].getAttribute('href').split('#')[1]
            if(dref===doubleclick) {
                tooltip.style.display = 'none';
                document.getElementById(dref).scrollIntoView();
                window.location.hash = '#'+dref
                doubleclick = false;
            } else {
                doubleclick = dref;
                tooltip.innerHTML = document.getElementById(dref + '_title').innerHTML;
                tooltip.style.position = 'fixed';
                tooltip.style.display = 'block';
                let coords = ev.target.getBoundingClientRect();
                let left = coords.left + (ev.target.offsetWidth - tooltip.offsetWidth) / 2;
                if(left < 0) left = 0;
                let top = coords.top - tooltip.offsetHeight - 5;
                if(top < 0) {
                    top = coords.top + ev.target.offsetHeight - 5;
                }
                tooltip.style.left = left + 'px';
                tooltip.style.top = top + 'px';
                if(tooltip.offsetLeft + tooltip.offsetWidth > window.innerWidth) {
                    tooltip.style.width = window.innerWidth + 'px';
                    tooltip.style.left = '0px';
                }
                return;
            }
        })
    }


    for(let b of Array.from(document.getElementsByClassName("spoiler"))) {
        b.addEventListener('click', ()=>{
            Array.from(document.getElementsByClassName('beep')).forEach((e)=>{
                e.classList.toggle('show');
            })
        })
    }
}

function opennamu_xss_filter(str) {
    return str.replace(/[&<>"']/g, function(match) {
        switch(match) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case "'":
                return '&#x27;';
            case '"':
                return '&quot;';
        }
    });
}

function opennamu_xss_filter_decode(str) {
    return str.replace(/&amp;|&lt;|&gt;|&#x27;|&quot;/g, function(match) {
        switch(match) {
            case '&amp;':
                return '&';
            case '&lt;':
                return '<';
            case '&gt;':
                return '>';
            case '&#x27;':
                return "'";
            case '&quot;':
                return '"';
        }
    });
}

function opennamu_do_id_check(data) {
    if(data.match(/\.|\:/)) {
        return 0;
    } else {
        return 1;
    }
}

function opennamu_do_ip_render() {
    for(let for_a = 0; for_a < document.getElementsByClassName('opennamu_render_ip').length; for_a++) {
        let ip = document.getElementsByClassName('opennamu_render_ip')[for_a].innerHTML.replace(/&amp;/g, '&');

        fetch('/api/ip/' + opennamu_do_url_encode(ip)).then(function(res) {
            return res.json();
        }).then(function(data) {
            if(document.getElementsByClassName('opennamu_render_ip')[for_a].id !== "opennamu_render_end") {
                document.getElementsByClassName('opennamu_render_ip')[for_a].innerHTML = data["data"];
                document.getElementsByClassName('opennamu_render_ip')[for_a].id = "opennamu_render_end";
            }
        });
    }
}

function opennamu_do_url_encode(data) {
    return encodeURIComponent(data);
}

function opennamu_cookie_split_regex(data) {
    return new RegExp('(?:^|; )' + data + '=([^;]*)');
}

function opennamu_get_main_skin_set(set_name) {
    return fetch("/api/setting/" + opennamu_do_url_encode(set_name)).then(function(res) {
        return res.json();
    }).then(function(text) {
        if(
            document.cookie.match(opennamu_cookie_split_regex(set_name)) &&
            document.cookie.match(opennamu_cookie_split_regex(set_name))[1] !== '' &&
            document.cookie.match(opennamu_cookie_split_regex(set_name))[1] !== 'default'
        ) {
            return document.cookie.match(opennamu_cookie_split_regex(set_name))[1];
        } else {
            if(text[set_name]) {
                return text[set_name][0][0];
            } else {
                return '';
            }
        }
    });
}

function opennamu_send_render(data) {
    if(data == '&lt;br&gt;' || data == '' || data.match(/^ +$/)) {
        data = '<br>';
    } else {
        data = data.replace(/( |^)(https?:\/\/(?:[^ ]+))/g, function(m0, m1, m2) {
            let link_main = m2;
            link_main = link_main.replace('"', '&quot;');

            return m1 + '<a href="' + link_main + '">' + link_main + '</a>';
        });
        data = data.replace(/&lt;a(?:(?:(?!&gt;).)*)&gt;((?:(?!&lt;\/a&gt;).)+)&lt;\/a&gt;/g, function(m0, m1) {
            let data_unescape = opennamu_xss_filter_decode(m1)

            return '<a href="/w/' + opennamu_do_url_encode(data_unescape) + '">' + m1 + '</a>'
        })
    }

    return data;
}

function opennamu_insert_v(name, data) {
    document.getElementById(name).value = data;
}

function opennamu_do_trace_spread() {
    if(document.getElementsByClassName('opennamu_trace')) {
        document.getElementsByClassName('opennamu_trace')[0].innerHTML = '' +
            '<style>.opennamu_trace_button { display: none; } .opennamu_trace { white-space: pre-wrap; overflow-x: unset; text-overflow: unset; }</style>' +
        '' + document.getElementsByClassName('opennamu_trace')[0].innerHTML
    }
}

function opennamu_do_render(to_obj, data, name = '', do_type = '', option = '') {
    let url;
    if(do_type === '') {
        url = "/api/render";
    } else {
        url = "/api/render/" + do_type;
    }

    fetch(url, {
        method : 'POST',
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' },
        body : new URLSearchParams({
            'name' : name,
            'data': data,
            'option' : option
        })
    }).then(function(res) {
        return res.json();
    }).then(function(text) {
        if(document.getElementById(to_obj)) {
            if(text["data"]) {
                document.getElementById(to_obj).innerHTML = text["data"];
                eval(text["js_data"]);
            } else {
                document.getElementById(to_obj).innerHTML = '';
            }
            postprocessing();
        }
    });
}

function opennamu_page_control(url, page, data_length, data_length_max = 50) {
    let next = function() {
        if(data_length_max === data_length) {
            return '<a href="' + url.replace('{}', String(page + 1)) + '">(+)</a>';
        } else {
            return '';
        }
    };

    let back = function() {
        if(page !== 1) {
            return '<a href="' + url.replace('{}', String(page - 1)) + '">(-)</a>';
        } else {
            return '';
        }
    };

    return (back() + ' ' + next()).replace(/^ /, '');
}

function openamu_make_list(left = '', right = '', bottom = '') {
    let data_html = '<div class="opennamu_recent_change">';
    data_html += left;
    
    data_html += '<div style="float: right;">';
    data_html += right;
    data_html += '</div>'

    data_html += '<div style="clear: both;"></div>';

    if(bottom !== "") {
        data_html += '<hr>'
        data_html += bottom;
    }

    data_html += '</div>';
    data_html += '<hr class="main_hr">';

    return data_html;
}