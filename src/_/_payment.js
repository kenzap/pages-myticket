import { __html, html, onClick, H, parseApiError, getCookie } from '@kenzap/k-cloud';
import { CDN, getParam } from "../_/_helpers.js"

export class Payment{

    // init class
    constructor(options){
        
        // console.log(options);
        this.options = options;

        // init user authentication
        this.init();
    }

    init = () => {

        // do API query
        fetch('https://api.checkout.app.kenzap.cloud', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Kenzap-Locale': getCookie('locale') ? getCookie('locale') : "en",
                'Kenzap-Sid': this.options.sid, 
            },
            body: JSON.stringify({
                query: {
                    methods: {
                        type: "get-methods",
                        test: getParam('test'),
                        url: window.location.href,
                    }
                }
            })
        })
        .then(response => response.json())
        .then(response => {

            if(response.success){

                this.methods = response.methods.list ? response.methods.list : [];

                // console.log(this.methods);
            }else{

                parseApiError(response);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    getMethods = () => {

        return this.methods;
    }

    pay = (obj) => {

        obj.type = obj.method;
        obj.url = window.location.href;
        if(getParam('test')) obj.test = true;

        // do API query
        fetch('https://api.checkout.app.kenzap.cloud', {
            method: 'post',
            // headers: H(),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Kenzap-Locale': getCookie('locale') ? getCookie('locale') : "en",
                'Kenzap-Sid': this.options.sid, 
            },
            body: JSON.stringify({
                query: {
                    checkout: obj
                }
            })
        })
        .then(response => response.json())
        .then(response => {

            if(response.success){

                response.eventid = obj.checkout.event._id;

                obj.success(response);

                window.location.href = response.checkout[obj.method];

                // switch(obj.method){

                //     case 'stripe':  window.location.href = response.checkout.stripe; break;
                //     case 'plugnpay':  window.location.href = response.checkout.plugnpay; break;
                //     case 'cash':  window.location.href = response.checkout.cash; break;
                //     case 'free':  window.location.href = response.checkout.free; break;
                // }
            }else{

                obj.fail(response);

                // parseApiError(response);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    /**
     * @name getAPI
     * @description Returns API link
     * @param {object} headers
     */
    getAPI = () => {

        return window.location.host.indexOf("localhost") == 0 ? "https://api.checkout-dev.app.kenzap.cloud" : "https://api.checkout.app.kenzap.cloud";
    }
}