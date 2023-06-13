import { __attr, __html, onClick, parseApiError, H } from '@kenzap/k-cloud';
import { setCookie, getCookie } from "../_/_helpers.js"

export class Dashboard{

    constructor(_this, id){

        this.sessionTimer;

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
    
        // init user authentication
        this.getData();
    }

    html = (_this) => {

        return `
            <div class="modal show session-modal" tabindex="-1" data-action="new" aria-modal="true" role="dialog" style="display: block;z-index:2060;">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${ __html('Session Expiring') }</h5>
                            <button type="button" class="btn-close d-none" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="form-cont">
                                <h2 class="mt-4 mb-0 session-countdown d-none">${ __html('Session Expiring') }</h2>
                                <div class="mb-3"> <img alt="welcome image" style="max-width:400px;margin:auto;display:block;" src="/assets/images/security.svg"> </div>
                                <p>${ __html('This is a security measure to protect your data. Please %1$extend the session%2$ or sign out by clicking on one of the buttons below.', '<b>', '</b>') }</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary btn-session-extend">${ __html('Extend session') }</button>
                            <button type="button" class="btn btn-secondary btn-sign-out" data-bs-dismiss="modal">${ __html('Sign out') }</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getData = () => {

        // show loader during first load
        if (_this.state.firstLoad) showLoader();

        // do API query
        fetch('https://api-v1.kenzap.cloud/', {
            method: 'post',
            headers: H(),
            body: JSON.stringify({
                query: {
                    keys: {
                        type:       'api-key',
                        keys:       ['private']
                    },
                    locale: {
                        type:       'locale',
                        id:         getCookie('lang')
                    },
                    mydata: {
                        type:       'mydata',
                    },
                    dashboard: {
                        type:       'dashboard',
                    }
                }
            })
        })
        .then(response => response.json())
        .then(response => {

            if(response.success){

                // init header
                initHeader(response);

                // // get core html content 
                // _this.loadHomeStructure();  

                // // render table
                // _this.renderPage(response);

                // // listeners
                // _this.initListeners();

                // // initiate footer
                // _this.initFooter();

                // // first load
                // _this.state.firstLoad = false;

            }else{

                parseApiError(response);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    keepAlive = (_this) => {

        let self = this;

        if(!_this.state.response.user.ttl || document.querySelector('.session-modal')) return;

        if(_this.state.sessionKeepAliveInterval) clearTimeout(_this.state.sessionKeepAliveInterval); 

        let sessionNotice = (_this) => {

            if(document.querySelector('.session-modal')) return;

            document.querySelector('body').insertAdjacentHTML('beforeend', '<div class="modal-backdrop show session-backdrop"> </div>');
            document.querySelector('body').insertAdjacentHTML('afterbegin', self.html(_this));

            self.listeners(_this);
 
            let display = document.querySelector('.btn-session-extend');

            self.startTimer(_this, parseInt(_this.state.response.user.ttl), display);
        }

        let extendSession = (_this) => {

            let interval = 90;

            _this.state.sessionKeepAliveInterval = setInterval((_this) => {

                // get latest TTL from the backend. Ex. User extended session in another window or the timeout was in sleep mode
                fetch(_this.state.api, {
                    // timeout: 5000,
                    method: 'post',
                    headers: H(),
                    body: JSON.stringify({
                        query: {
                            session: {
                                type:       'get-ttl',
                                token:      getCookie('sicc_token')
                            },
                        }
                    })
                })
                .then(response => response.json())
                .then(response => {

                    // check if authenticated
                    if(!response.success) if(!response.code == 404) location.reload();

                    // parse ttl reply
                    if(response.session) if(response.session.ttl){
                        
                        _this.state.response.user.ttl = response.session.ttl;

                        console.log("TTL: " + response.session.ttl);

                        let ttl = parseInt(_this.state.response.user.ttl);
    
                        // ttl matches the timeout expiration, trigger warning window
                        if(parseInt(ttl) < 300){
            
                            sessionNotice(_this);
                        }
                    }
                })
                .catch(error => {

                    console.log(error);
                    // parseApiError(error); 
                });
        
            }, interval * 1000, _this); // before 2 minutes
        }

        // session extension loop
        extendSession(_this);

        // check immediately after page loaded
        if(_this.state.response.user.ttl) if(parseInt(_this.state.response.user.ttl) < 300){ sessionNotice(_this); }

        // for debug purpose
        // sessionNotice(_this);
    }

    listeners = (_this) => {

        let self = this;

        onClick('.btn-session-extend', e => {

            self.extendSession(_this);
        });

        onClick('.btn-sign-out', e => {

            // self.signOut(_this);
            // signOut(_this);
        });
    }

    startTimer = (_this, ttl, display) => {
        
        let self = this;

        let timer = ttl, minutes, seconds;

        let loop = () => {

            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);
    
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
    
            // iu dismissed, clear timer
            if(!document.querySelector('.btn-session-extend')){ clearInterval(self.sessionTimer); return; }

            // show validation countdow timer
            if(!document.querySelector('.btn-session-extend').dataset.loading) display.textContent = __html('Extend Session (%1$)', minutes + ":" + seconds);
    
            // timer runs out, force request new otp
            if (--timer < 0) {

                // clear timer
                if(self.sessionTimer) clearInterval(self.sessionTimer);

                // sign out
                location.reload();
            }
        }

        loop(); self.sessionTimer = setInterval(() => { loop(); }, 1000);
    }

    // extend session
    extendSession = (_this) => {

        // UI is blocked
        if(document.querySelector('.btn-session-extend').dataset.loading) return;
        
        document.querySelector('.btn-session-extend').dataset.loading = true;
        document.querySelector('.btn-session-extend').innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>' + __html('Loading..');
        
        if(self.sessionTimer) clearInterval(self.sessionTimer); 

        // send data
        fetch(_this.state.api, {
            method: 'post',
            headers: H(),
            body: JSON.stringify({
                query: {
                    session: {
                        type:       'extend-session',
                        token:      getCookie('sicc_token')
                    },
                }
            })
        })
        .then(response => response.json())
        .then(response => {

            // console.log(response);
            document.querySelector('.btn-session-extend').dataset.loading = false;
            document.querySelector('.btn-session-extend').innerHTML = __html('Extend session');    

            if (response.session.success){
                
                _this.state.response.user.ttl = response.session.ttl;

                // modal-backdrop

                document.querySelector('.session-backdrop').remove();
                document.querySelector('.session-modal').remove();

                // restart countdown session timer
                _this.state.session = new KeepAlive(_this);

                // console.log("extended " + response.session.ttl);

            }else{

                // session expired reload TODO add notification message
                location.reload();

                // parseApiError(response);
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
}
