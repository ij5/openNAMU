"use strict";

let doubleclick = false;

document.addEventListener('DOMContentLoaded', ()=>{
    let tooltip = document.createElement('span');
    tooltip.classList.add('tooltip');
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);

    const rfns = document.getElementsByClassName('rfn')
    document.addEventListener('click', (ev)=>{
        if(!ev.target.id.startsWith('rfn') && tooltip.style.display !== 'none'){
            tooltip.style.display = 'none';
            doubleclick = false;
        }
    })
    for(let i = 0; i < rfns.length; i++) {
        rfns[i].addEventListener('click', (ev)=>{
            ev.preventDefault();
            if(!doubleclick) {
                doubleclick = true;
                tooltip.innerHTML = document.getElementById('d'+rfns[i].children[0].getAttribute('href').split('#')[1]).innerHTML;
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
                console.log(tooltip.offsetLeft + tooltip.offsetWidth)
                console.log(window.innerWidth)
                if(tooltip.offsetLeft + tooltip.offsetWidth > window.innerWidth) {
                    tooltip.style.width = window.innerWidth + 'px';
                }
                return;
            }
            tooltip.style.display = 'none';
            document.getElementById(rfns[i].children[0].getAttribute('href').split('#')[1]).scrollIntoView();
            doubleclick = false;
        })
    }
})

function opennamu_do_id_check(data) {
    if(data.match(/\.|\:/)) {
        return 0;
    } else {
        return 1;
    }
}

function opennamu_do_url_encode(data) {
    return encodeURIComponent(data);
}

function opennamu_cookie_split_regex(data) {
    return new RegExp('(?:^|; )' + data + '=([^;]*)');
}