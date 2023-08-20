// dependencies
import { showLoader, hideLoader, attr, __html, parseApiError, slugify, onClick, H } from '@kenzap/k-cloud';
import { getCookie, getParam } from "../_/_helpers.js"
// import { HTMLContent } from "../_/_cnt_success.js"

class kZtMlO{

    // init class
    constructor(data){
        
        this.state = {
            firstLoad: true,
            html: '',
            data: {},
            ajaxQueue: 0,
            limit: 25,
            responseKey: [],
            modal: null,
            modalCont: null,
            editor: {},
        };

        // cache data
        this.data = data;

        // init container
        this.html();
    
        // init user authentication
        this.load();
    }

    // init container
    html = () => {

        document.querySelector('#content').insertAdjacentHTML('beforeend', 
        `
        <section id="${ attr(this.data.id) }" class="kZtMlO ${ this.data.c.classes ? attr(this.data.c.classes) : '' }" style="${ this.data.c.section };${ this.data.borderstyle.value ? '--borderStyle:'+this.data.borderstyle.value+'px;' : '' }">
            <div class="container" style="${ this.data.c.container }">
  

            </div>
        </section>
        `
        );
    }

    // load data
    load = () => {

        let self = this;

        // show loader during first load
        if (this.state.firstLoad) showLoader();

        let s = "";

        // do API query
        fetch(this.getAPI(), {
            method: 'post',
            // headers: H(),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Kenzap-Locale': getCookie('locale') ? getCookie('locale') : "en",
                // 'Kenzap-Token': self.data.token.value,
                'Kenzap-Sid': self.data.sid, 
            },
            body: JSON.stringify({
                query: {
                    order: {
                        type:       'verify-order',
                        trans_id:   getParam('id')
                    },
                }
            })
        })
        .then(response => response.json())
        .then(response => {

            if(response.success){

                this.state.response = response;

                // render table
                this.render();

                // listeners
                this.listeners();

                // first load
                this.state.firstLoad = false;

            }else{

                if(response.code==401){

                    document.querySelector('#' + this.data.id + ' .container').innerHTML = `${ __html('this order does not exist or already expired') }`;

                    return;
                }

                parseApiError(response);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // https://api.myticket-dev.app.kenzap.cloud/?cmd=view_ticket&ext_token=1003165&trans_id=8ec6de0380335becda592ed6c1884e4390a77e39

    // assign class html
    render = () => {

        document.querySelector('#' + this.data.id + ' .container').innerHTML = `

            <div class="section-page-header">
                <div class="container">
                    <h1 class="entry-title">${ __html('Download Your Ticket') }</h1>
                </div>
            </div>
            <div class="section-page-content">
                <main id="main" class="container">
                    <div class="row">
                        <div class="section-download-ticket-cont">
                            <div class="section-download-ticket" >
                                <div class="kenzap-container" style="max-width:1170px">
                                    <noscript><img src="https://static.kenzap.com/layouts/event/download-ticket-img.png" alt="Download image"></noscript><img class=" lazyloaded" src="https://static.kenzap.com/layouts/event/download-ticket-img.png" data-src="https://static.kenzap.com/layouts/event/download-ticket-img.png" alt="Download image">
                                    <p>${ __html('Thank you for purchasing "%1$%2$%3$" ticket.', '<strong>', __html(this.state.response.order.title), '</strong>') }</p>
                                    ${
                                        this.data.general_ticket.value == "1" 
                                        ?
                                        `
                                        <p>${ __html('You can download all tickets by clicking %1$Download%2$ button below.', '<strong>', '</strong>') }</p>
                                        <a target="_blank" class="primary-link download-ticket" href="${ attr(this.getAPI() + `?cmd=view_ticket&ext_token=${ attr(this.data.sid) }&trans_id=${ attr(getParam('id')) }`) }">${  __html('Download Your Ticket') }</a>
                                        `
                                        :
                                        `
                                        `
                                    }
                                </div>
                            </div>
                        </div>
                        ${
                            this.data.individual_ticket.value == "1" 
                            ?
                            `
                            <div class="row">   
                                <div class="section-download-ticket-multi">
                                    <h4>${ __html('Download each ticket individually') }</h4>
                                    ${ 
                                        this.state.response.order.checkout.holders.map((holder, i) => {
                                            
                                            return `
                                            <a target="_blank" href="${ attr(this.getAPI() + `?cmd=view_ticket&ext_token=${ attr(this.data.sid) }&trans_id=${ attr(getParam('id')) }&holder=${ attr(i) }`) }" data-index="${ attr(i) }" class="download-ticket">${ __html('Download ticket #%1$', (i+1)) }</a>
                                            `

                                        }).join()
                                    }
                                </div>
                            </div>
                            `
                            :
                            `
                            `
                        }
                    </div>
                </main>
            </div>`;

        hideLoader();
    }

    // all listeners and events
    listeners = () => {

        let self = this;

        // prevents listeners to be assigned twice
        if(!self.state.firstLoad) return;

        // add ticket download listener via blob url
        // onClick('.download-ticket', self.viewTicket);
    }

    viewTicket = (e) => {

        let self = this;
        
        e.preventDefault();

        if(document.querySelector('.download-ticket').dataset.loading) return;

        document.querySelector('.download-ticket').dataset.loading = true;

        let query = {
            order: {
                type:       'view-ticket',
                trans_id:   getParam('id')
            }
        }

        if(e.currentTarget.dataset.index) query.order.holder = e.currentTarget.dataset.index;
        
        fetch(this.getAPI(), {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Kenzap-Locale': getCookie('locale') ? getCookie('locale') : "en",
                // 'Kenzap-Token': self.data.token.value,
                'Kenzap-Sid': self.data.sid, 
            },
            body: JSON.stringify({
                query: query
            })
        })
        .then(response => response.blob())
        .then(data => {
            
            document.querySelector('.download-ticket').dataset.loading = "";

            // probably not a file, check for errors
            if(data.size < 100){
    
                data.text().then(function(result) {
                    
                    let js = JSON.parse(result);
                    if(!js.success){
    
                        // parseApiDashboardError(this, js);
                    }
                });
    
            // parse output
            }else{
    
                let url = URL.createObjectURL(data);

                window.open(url, '_blank');

                // document.querySelector('.test-download').setAttribute('src', url);

                // window.open(url);
            }
        })
        .catch(error => { 
    
            parseApiError(error); 
        });

    }

    // sync html with data
    cache = () => {

        localStorage.setItem(this.id, JSON.stringify(this.state));
    }
    
    /**
     * @name getAPI
     * @description Returns API link
     * @param {object} headers
     */
    getAPI = () => {

        return window.location.host.indexOf("localhost") == 0 ? "https://api.myticket-dev.app.kenzap.cloud/" : "https://api.myticket.app.kenzap.cloud/";
    }
}

window.kZtMlO = kZtMlO;