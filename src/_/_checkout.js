import { __html, html, onClick, H } from '@kenzap/k-cloud';
import { CDN, getParam, validateEmail } from "../_/_helpers.js"

export class Checkout{

    // init class
    constructor(data, cont){
        
        this.state = {
            data: data,
            inQuery: false,
            cont: cont,
        };
    
        // console.log(cont);

        // init user authentication
        this.init();
    }

    init = () => {

        // alert((new URL(window.location.href)).hostname);

        let self = this, d = document;

        document.querySelector('.btn-checkout').addEventListener('click', function(e) {

            e.preventDefault();

            if(d.querySelector(this.dataset.src)==null) return false;

            let box = `
                <div id="kbox-container" class="kbox-container kbox-container--ready" role="dialog" tabindex="-1" style="display:block;">
                    <div class="kbox-bg" style="transition-duration: 330ms;"></div>
                    <div class="kbox-slider-wrap kbox-slide">${ d.querySelector(this.dataset.src).outerHTML }</div>
                </div>`;

            let pb = d.querySelector('input[name="pack-group"]:checked');
            if(!pb) return;

            // check if package is not sold out
            if(pb.dataset.soldout == 'soldout'){

                alert(__html('This package is sold out, please choose another package.'));
                return;
            }

            let qty = parseInt(d.querySelector(".num").value);
            let price = pb.dataset.price*qty;

            let tickets = Array(qty).fill(0);

            // let btn = d.querySelector(".btn-checkout");
            // btn.setAttribute('data-price', price);

            d.querySelector('#'+self.state.cont).insertAdjacentHTML("afterBegin", box);
            d.querySelector('html').classList.add("ns");

            document.querySelector("#checkout-box .content-area").innerHTML = `

                <div id="bd" class="bill-form">
                    <div class="form-cont ge-form form__fieldset">

                        <div class="holder-cont">
                        ${
                            tickets.map((obj, i) => {

                                return `
                                    <h5>${ __html('#%1$ Ticket Holder', i+1) }</h4>
                                    <div class="form-grid">
                                        <div class="form-grid__whole">
                                            <div class="form-field" data-field="ticketName${i}">
                                                <div class="form-field__item form-field__item--text">
                                                    <input id="ticketName${i}" class="input form-field__input input--text required" name="ticketName" type="text" required="">
                                                    <label for="ticketName${i}" class="form-field__label form-field__label--dynamic">${ __html('Full Name') }</label>
                                                </div>
                                                <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">${ __html('Ticket holder name and surname') }</div>
                                            </div>
                                        </div>
                                        <div class="form-grid__whole">
                                            <div class="form-field" data-field="ticketEmail${i}">
                                                <div class="form-field__item form-field__item--text">
                                                    <input id="ticketEmail${i}" class="input form-field__input input--email required" name="ticketEmail" type="text" required="">
                                                    <label for="ticketEmail${i}" class="form-field__label form-field__label--dynamic">${ __html('Email Address') }</label>
                                                </div>
                                                <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">${ __html('Ticket holder email address') }</div>
                                            </div>
                                        </div>
                                        <div class="form-grid__whole">
                                            <div class="form-field" data-field="ticketPhone${i}">
                                                <div class="form-field__item form-field__item--text">
                                                    <input id="ticketPhone${i}" class="input form-field__input input--phone required" name="ticketPhone" type="text" required="">
                                                    <label for="ticketPhone${i}" class="form-field__label form-field__label--dynamic">${ __html('Phone Number') }</label>
                                                </div>
                                                <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">${ __html('Ticket holder phone number') }</div>
                                            </div>
                                        </div>
                                    </div>
                                `;

                            }).join('')
                        }
                        </div>
                            
                        <div class="tax-cont dn">
                            <h5>${ __html('Invoice Information') }</h5>
                            <div class="form-grid">
                                <div class="form-grid__half">
                                    <div class="form-field" data-field="firstName">
                                        <div class="form-field__item form-field__item--text">
                                            <input id="firstName" class="input form-field__input input--text required" data-group="tax" name="firstName" type="text" required="">
                                            <label for="firstName" class="form-field__label form-field__label--dynamic">First name</label>
                                        </div>
                                        <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">First name is required</div>
                                    </div>
                                </div>
                                <div class="form-grid__half">
                                    <div class="form-field" data-field="lastName">
                                        <div class="form-field__item form-field__item--text">
                                            <input id="lastName" class="input form-field__input input--text required" data-group="tax" name="lastName" type="text" required="">
                                            <label for="lastName" class="form-field__label form-field__label--dynamic">Last name</label>
                                        </div>
                                        <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">Last name is required</div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-grid">
                                <div class="form-grid__half">
                                    <div class="form-field form-field--has-value" data-field="countryField">
                                        <div class="form-field__item form-field__item--select">
                                            <label for="countryField" class="form-field__label form-field__label--dynamic">Country</label>
                                            <select name="countryField" id="countryField" class="input form-field__input input--select required" data-group="tax">
                                                <option value="">Select your country</option>
                                                    <optgroup label="Popular countries">
                                                    <option data-country-id="AU" data-country-marketing-consent="true" data-enable-sales-tax-number="false" data-states="Australian Capital Territory|New South Wales|Northern Territory|Queensland|South Australia|Tasmania|Victoria|Western Australia" value="AU">Australia</option>
                                                    <option data-country-id="BR" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BR">Brazil</option>
                                                    <option data-country-id="CA" data-country-marketing-consent="true" data-enable-sales-tax-number="false" data-states="Alberta|British Columbia|Manitoba|New Brunswick|Newfoundland and Labrador|Northwest Territories|Nova Scotia|Nunavut|Ontario|Prince Edward Island|Quebec:ca_qst:QST Registration Number:1234567890TQ1234:1:1|Yukon" value="CA">Canada</option>
                                                    <option data-country-id="FR" data-country-marketing-consent="false" data-vat-prefix="FR" data-vat-example="FR12345678901" data-vat-local-lang="n° TVA" data-enable-sales-tax-number="false" value="FR">France</option>
                                                    <option data-country-id="DE" data-country-marketing-consent="false" data-vat-prefix="DE" data-vat-example="DE123456789" data-vat-local-lang="USt-IdNr." data-enable-sales-tax-number="false" value="DE">Germany</option>
                                                    <option data-country-id="IT" data-country-marketing-consent="false" data-vat-prefix="IT" data-vat-example="IT12345678901" data-vat-local-lang="P. IVA" data-enable-sales-tax-number="false" value="IT">Italy</option>
                                                    <option data-country-id="ID" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="ID">Indonesia</option>
                                                    <option data-country-id="NL" data-country-marketing-consent="false" data-vat-prefix="NL" data-vat-example="NL123456789B01" data-vat-local-lang="Btw-nr." data-enable-sales-tax-number="false" value="NL">Netherlands</option>
                                                    <option data-country-id="ES" data-country-marketing-consent="false" data-vat-prefix="ES" data-vat-example="ES12345678X" data-vat-local-lang="NIF / CIF" data-enable-sales-tax-number="false" value="ES">Spain</option>
                                                    <option data-country-id="SG" data-country-marketing-consent="true" data-enable-sales-tax-number="true" data-sales-tax-number-label="GST Registration Number" data-sales-tax-number-example="M12345678X" data-sales-tax-number-type="sg_gst" value="SG" selected="selected">Singapore</option>
                                                    <option data-country-id="GB" data-country-marketing-consent="false" data-vat-prefix="GB" data-vat-example="GB123456789" data-enable-sales-tax-number="false"  value="GB">United Kingdom</option>
                                                    <option data-country-id="US" data-country-marketing-consent="true" data-enable-sales-tax-number="false" data-states="Alabama|Alaska|American Samoa|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|District of Columbia|Florida|Georgia|Hawaii|Idaho|Illinois|Indianav|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming" value="US">United States</option>
                                                    </optgroup>
                                                    <optgroup label="All countries">
                                                    <option data-country-id="AF" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="AF">Afghanistan</option>
                                                    <option data-country-id="AL" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="AL">Albania</option>
                                                    <option data-country-id="DZ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="DZ">Algeria</option>
                                                    <option data-country-id="AS" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="AS">American Samoa</option>
                                                    <option data-country-id="AD" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="AD">Andorra</option>
                                                    <option data-country-id="AO" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="AO">Angola</option>
                                                    <option data-country-id="AI" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="AI">Anguilla</option>
                                                    <option data-country-id="AQ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="AQ">Antarctica</option>
                                                    <option data-country-id="AG" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="AG">Antigua and Barbuda</option>
                                                    <option data-country-id="AR" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="AR">Argentina</option>
                                                    <option data-country-id="AM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="AM">Armenia</option>
                                                    <option data-country-id="AW" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="AW">Aruba</option>
                                                    <option data-country-id="AU" data-country-marketing-consent="true" data-enable-sales-tax-number="false" data-states="Australian Capital Territory|New South Wales|Northern Territory|Queensland|South Australia|Tasmania|Victoria|Western Australia" value="AU">Australia</option>
                                                    <option data-country-id="AT" data-country-marketing-consent="false" data-vat-prefix="AT" data-vat-example="ATU12345678" data-vat-local-lang="UID" data-enable-sales-tax-number="false" value="AT">Austria</option>
                                                    <option data-country-id="AZ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="AZ">Azerbaijan</option>
                                                    <option data-country-id="BS" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BS">Bahamas</option>
                                                    <option data-country-id="BH" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BH">Bahrain</option>
                                                    <option data-country-id="BD" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BD">Bangladesh</option>
                                                    <option data-country-id="BB" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BB">Barbados</option>
                                                    <option data-country-id="BY" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BY">Belarus</option>
                                                    <option data-country-id="BE" data-country-marketing-consent="false" data-vat-prefix="BE" data-vat-example="BE1234567890" data-vat-local-lang="n° TVA / BTW-Nr / Mwst-Nr" data-enable-sales-tax-number="false" value="BE">Belgium</option>
                                                    <option data-country-id="BZ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BZ">Belize</option>
                                                    <option data-country-id="BJ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BJ">Benin</option>
                                                    <option data-country-id="BM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BM">Bermuda</option>
                                                    <option data-country-id="BT" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BT">Bhutan</option>
                                                    <option data-country-id="BO" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BO">Bolivia, Plurinational State of</option>
                                                    <option data-country-id="BQ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BQ">Bonaire, Sint Eustatius and Saba</option>
                                                    <option data-country-id="BA" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BA">Bosnia and Herzegovina</option>
                                                    <option data-country-id="BW" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BW">Botswana</option>
                                                    <option data-country-id="BV" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BV">Bouvet Island</option>
                                                    <option data-country-id="BR" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BR">Brazil</option>
                                                    <option data-country-id="IO" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="IO">British Indian Ocean Territory</option>
                                                    <option data-country-id="BN" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BN">Brunei Darussalam</option>
                                                    <option data-country-id="BG" data-country-marketing-consent="false" data-vat-prefix="BG" data-vat-example="BG123456789" data-vat-local-lang="ДДС номер" data-enable-sales-tax-number="false" value="BG">Bulgaria</option>
                                                    <option data-country-id="BF" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BF">Burkina Faso</option>
                                                    <option data-country-id="BI" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BI">Burundi</option>
                                                    <option data-country-id="CV" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CV">Cabo Verde</option>
                                                    <option data-country-id="KH" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="KH">Cambodia</option>
                                                    <option data-country-id="CM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CM">Cameroon</option>
                                                    <option data-country-id="CA" data-country-marketing-consent="true" data-enable-sales-tax-number="false"  data-states="Alberta|British Columbia|Manitoba|New Brunswick|Newfoundland and Labrador|Northwest Territories|Nova Scotia|Nunavut|Ontario|Prince Edward Island|Quebec:ca_qst:QST Registration Number:1234567890TQ1234:1:1|Yukon" value="CA">Canada</option>
                                                    <option data-country-id="KY" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="KY">Cayman Islands</option>
                                                    <option data-country-id="CF" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CF">Central African Republic</option>
                                                    <option data-country-id="TD" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TD">Chad</option>
                                                    <option data-country-id="CL" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CL">Chile</option>
                                                    <option data-country-id="CN" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CN">China</option>
                                                    <option data-country-id="CX" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CX">Christmas Island</option>
                                                    <option data-country-id="CC" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CC">Cocos (Keeling) Islands</option>
                                                    <option data-country-id="CO" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CO">Colombia</option>
                                                    <option data-country-id="KM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="KM">Comoros</option>
                                                    <option data-country-id="CG" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CG">Congo</option>
                                                    <option data-country-id="CD" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CD">Congo, the Democratic Republic of the</option>
                                                    <option data-country-id="CK" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CK">Cook Islands</option>
                                                    <option data-country-id="CR" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CR">Costa Rica</option>
                                                    <option data-country-id="HR" data-country-marketing-consent="false" data-vat-prefix="HR" data-vat-example="HR12345678901" data-vat-local-lang="PDV-ID; OIB" data-enable-sales-tax-number="false" value="HR">Croatia</option>
                                                    <option data-country-id="CW" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CW">Curaçao</option>
                                                    <option data-country-id="CY" data-country-marketing-consent="false" data-vat-prefix="CY" data-vat-example="CY12345678X" data-vat-local-lang="ΦΠΑ" data-enable-sales-tax-number="false" value="CY">Cyprus</option>
                                                    <option data-country-id="CZ" data-country-marketing-consent="false" data-vat-prefix="CZ" data-vat-example="CZ12345678" data-vat-local-lang="DIČ" data-enable-sales-tax-number="false" value="CZ">Czech Republic</option>
                                                    <option data-country-id="CI" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CI">Côte d'Ivoire</option>
                                                    <option data-country-id="DK" data-country-marketing-consent="false" data-vat-prefix="DK" data-vat-example="DK12345678" data-vat-local-lang="CVR" data-enable-sales-tax-number="false" value="DK">Denmark</option>
                                                    <option data-country-id="DJ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="DJ">Djibouti</option>
                                                    <option data-country-id="DM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="DM">Dominica</option>
                                                    <option data-country-id="DO" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="DO">Dominican Republic</option>
                                                    <option data-country-id="EC" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="EC">Ecuador</option>
                                                    <option data-country-id="EG" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="EG">Egypt</option>
                                                    <option data-country-id="SV" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SV">El Salvador</option>
                                                    <option data-country-id="GQ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GQ">Equatorial Guinea</option>
                                                    <option data-country-id="ER" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="ER">Eritrea</option>
                                                    <option data-country-id="EE" data-country-marketing-consent="false" data-vat-prefix="EE" data-vat-example="EE123456789" data-vat-local-lang="KMKR" data-enable-sales-tax-number="false" value="EE">Estonia</option>
                                                    <option data-country-id="ET" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="ET">Ethiopia</option>
                                                    <option data-country-id="FK" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="FK">Falkland Islands (Malvinas)</option>
                                                    <option data-country-id="FO" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="FO">Faroe Islands</option>
                                                    <option data-country-id="FJ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="FJ">Fiji</option>
                                                    <option data-country-id="FI" data-country-marketing-consent="false" data-vat-prefix="FI" data-vat-example="FI12345678" data-vat-local-lang="ALV nro" data-enable-sales-tax-number="false" value="FI">Finland</option>
                                                    <option data-country-id="FR" data-country-marketing-consent="false" data-vat-prefix="FR" data-vat-example="FR12345678901" data-vat-local-lang="n° TVA" data-enable-sales-tax-number="false" value="FR">France</option>
                                                    <option data-country-id="GF" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GF">French Guiana</option>
                                                    <option data-country-id="PF" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="PF">French Polynesia</option>
                                                    <option data-country-id="TF" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TF">French Southern Territories</option>
                                                    <option data-country-id="GA" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GA">Gabon</option>
                                                    <option data-country-id="GM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GM">Gambia</option>
                                                    <option data-country-id="GE" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GE">Georgia</option>
                                                    <option data-country-id="DE" data-country-marketing-consent="false" data-vat-prefix="DE" data-vat-example="DE123456789" data-vat-local-lang="USt-IdNr." data-enable-sales-tax-number="false" value="DE">Germany</option>
                                                    <option data-country-id="GH" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GH">Ghana</option>
                                                    <option data-country-id="GI" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GI">Gibraltar</option>
                                                    <option data-country-id="GR" data-country-marketing-consent="false" data-vat-prefix="EL" data-vat-example="EL123456789" data-vat-local-lang="ΑΦΜ" data-enable-sales-tax-number="false" value="GR">Greece</option>
                                                    <option data-country-id="GL" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GL">Greenland</option>
                                                    <option data-country-id="GD" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GD">Grenada</option>
                                                    <option data-country-id="GP" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GP">Guadeloupe</option>
                                                    <option data-country-id="GU" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GU">Guam</option>
                                                    <option data-country-id="GT" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GT">Guatemala</option>
                                                    <option data-country-id="GG" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GG">Guernsey</option>
                                                    <option data-country-id="GN" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GN">Guinea</option>
                                                    <option data-country-id="GW" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GW">Guinea-Bissau</option>
                                                    <option data-country-id="GY" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GY">Guyana</option>
                                                    <option data-country-id="HT" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="HT">Haiti</option>
                                                    <option data-country-id="HM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="HM">Heard Island and McDonald Islands</option>
                                                    <option data-country-id="VA" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="VA">Holy See (Vatican City State)</option>
                                                    <option data-country-id="HN" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="HN">Honduras</option>
                                                    <option data-country-id="HK" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="HK">Hong Kong</option>
                                                    <option data-country-id="HU" data-country-marketing-consent="false" data-vat-prefix="HU" data-vat-example="HU12345678" data-vat-local-lang="ANUM" data-enable-sales-tax-number="false" value="HU">Hungary</option>
                                                    <option data-country-id="IS" data-country-marketing-consent="false" data-enable-sales-tax-number="false" value="IS">Iceland</option>
                                                    <option data-country-id="IN" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="IN">India</option>
                                                    <option data-country-id="ID" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="ID">Indonesia</option>
                                                    <option data-country-id="IQ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="IQ">Iraq</option>
                                                    <option data-country-id="IE" data-country-marketing-consent="false" data-vat-prefix="IE" data-vat-example="IE1234567XX" data-vat-local-lang="VAT no" data-enable-sales-tax-number="false" value="IE">Ireland</option>
                                                    <option data-country-id="IM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="IM">Isle of Man</option>
                                                    <option data-country-id="IL" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="IL">Israel</option>
                                                    <option data-country-id="IT" data-country-marketing-consent="false" data-vat-prefix="IT" data-vat-example="IT12345678901" data-vat-local-lang="P. IVA" data-enable-sales-tax-number="false" value="IT">Italy</option>
                                                    <option data-country-id="JM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="JM">Jamaica</option>
                                                    <option data-country-id="JP" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="JP">Japan</option>
                                                    <option data-country-id="JE" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="JE">Jersey</option>
                                                    <option data-country-id="JO" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="JO">Jordan</option>
                                                    <option data-country-id="KZ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="KZ">Kazakhstan</option>
                                                    <option data-country-id="KE" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="KE">Kenya</option>
                                                    <option data-country-id="KI" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="KI">Kiribati</option>
                                                    <option data-country-id="KR" data-country-marketing-consent="true" data-enable-sales-tax-number="true" data-sales-tax-number-label="Tax Identification Number" data-sales-tax-number-example="123-45-67890" data-sales-tax-number-type="kr_vat" value="KR">Korea, Republic of</option>
                                                    <option data-country-id="XK" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="XK">Kosovo</option>
                                                    <option data-country-id="KW" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="KW">Kuwait</option>
                                                    <option data-country-id="KG" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="KG">Kyrgyzstan</option>
                                                    <option data-country-id="LA" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="LA">Lao People's Democratic Republic</option>
                                                    <option data-country-id="LV" data-country-marketing-consent="false" data-vat-prefix="LV" data-vat-example="LV12345678901" data-vat-local-lang="PVN" data-enable-sales-tax-number="false" value="LV">Latvia</option>
                                                    <option data-country-id="LB" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="LB">Lebanon</option>
                                                    <option data-country-id="LS" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="LS">Lesotho</option>
                                                    <option data-country-id="LR" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="LR">Liberia</option>
                                                    <option data-country-id="LY" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="LY">Libya</option>
                                                    <option data-country-id="LI" data-country-marketing-consent="false" data-enable-sales-tax-number="false" value="LI">Liechtenstein</option>
                                                    <option data-country-id="LT" data-country-marketing-consent="false" data-vat-prefix="LT" data-vat-example="LT123456789" data-vat-local-lang="PVM kodas" data-enable-sales-tax-number="false" value="LT">Lithuania</option>
                                                    <option data-country-id="LU" data-country-marketing-consent="false" data-vat-prefix="LU" data-vat-example="LU12345678" data-vat-local-lang="No. TVA" data-enable-sales-tax-number="false" value="LU">Luxembourg</option>
                                                    <option data-country-id="MO" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MO">Macao</option>
                                                    <option data-country-id="MK" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MK">Macedonia, the former Yugoslav Republic of</option>
                                                    <option data-country-id="MG" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MG">Madagascar</option>
                                                    <option data-country-id="MW" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MW">Malawi</option>
                                                    <option data-country-id="MY" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MY">Malaysia</option>
                                                    <option data-country-id="MV" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MV">Maldives</option>
                                                    <option data-country-id="ML" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="ML">Mali</option>
                                                    <option data-country-id="MT" data-country-marketing-consent="false" data-vat-prefix="MT" data-vat-example="MT12345678" data-vat-local-lang="Vat No." data-enable-sales-tax-number="false" value="MT">Malta</option>
                                                    <option data-country-id="MH" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MH">Marshall Islands</option>
                                                    <option data-country-id="MQ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MQ">Martinique</option>
                                                    <option data-country-id="MR" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MR">Mauritania</option>
                                                    <option data-country-id="MU" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MU">Mauritius</option>
                                                    <option data-country-id="YT" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="YT">Mayotte</option>
                                                    <option data-country-id="MX" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MX">Mexico</option>
                                                    <option data-country-id="FM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="FM">Micronesia, Federated States of</option>
                                                    <option data-country-id="MD" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MD">Moldova, Republic of</option>
                                                    <option data-country-id="MC" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MC">Monaco</option>
                                                    <option data-country-id="MN" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MN">Mongolia</option>
                                                    <option data-country-id="ME" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="ME">Montenegro</option>
                                                    <option data-country-id="MS" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MS">Montserrat</option>
                                                    <option data-country-id="MA" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MA">Morocco</option>
                                                    <option data-country-id="MZ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MZ">Mozambique</option>
                                                    <option data-country-id="MM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MM">Myanmar</option>
                                                    <option data-country-id="NA" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="NA">Namibia</option>
                                                    <option data-country-id="NR" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="NR">Nauru</option>
                                                    <option data-country-id="NP" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="NP">Nepal</option>
                                                    <option data-country-id="NL" data-country-marketing-consent="false" data-vat-prefix="NL" data-vat-example="NL123456789B01" data-vat-local-lang="Btw-nr." data-enable-sales-tax-number="false" value="NL">Netherlands</option>
                                                    <option data-country-id="NC" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="NC">New Caledonia</option>
                                                    <option data-country-id="NZ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="NZ">New Zealand</option>
                                                    <option data-country-id="NI" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="NI">Nicaragua</option>
                                                    <option data-country-id="NE" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="NE">Niger</option>
                                                    <option data-country-id="NG" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="NG">Nigeria</option>
                                                    <option data-country-id="NU" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="NU">Niue</option>
                                                    <option data-country-id="NF" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="NF">Norfolk Island</option>
                                                    <option data-country-id="MP" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MP">Northern Mariana Islands</option>
                                                    <option data-country-id="NO" data-country-marketing-consent="false" data-enable-sales-tax-number="false" value="NO">Norway</option>
                                                    <option data-country-id="OM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="OM">Oman</option>
                                                    <option data-country-id="PK" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="PK">Pakistan</option>
                                                    <option data-country-id="PW" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="PW">Palau</option>
                                                    <option data-country-id="PS" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="PS">Palestine, State of</option>
                                                    <option data-country-id="PA" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="PA">Panama</option>
                                                    <option data-country-id="PG" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="PG">Papua New Guinea</option>
                                                    <option data-country-id="PY" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="PY">Paraguay</option>
                                                    <option data-country-id="PE" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="PE">Peru</option>
                                                    <option data-country-id="PH" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="PH">Philippines</option>
                                                    <option data-country-id="PN" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="PN">Pitcairn</option>
                                                    <option data-country-id="PL" data-country-marketing-consent="false" data-vat-prefix="PL" data-vat-example="PL1234567890" data-vat-local-lang="NIP" data-enable-sales-tax-number="false" value="PL">Poland</option>
                                                    <option data-country-id="PT" data-country-marketing-consent="false" data-vat-prefix="PT" data-vat-example="PT123456789" data-vat-local-lang="NIF / NIPC" data-enable-sales-tax-number="false" value="PT">Portugal</option>
                                                    <option data-country-id="PR" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="PR">Puerto Rico</option>
                                                    <option data-country-id="QA" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="QA">Qatar</option>
                                                    <option data-country-id="RO" data-country-marketing-consent="false" data-vat-prefix="RO" data-vat-example="RO1234567890" data-vat-local-lang="CIF" data-enable-sales-tax-number="false" value="RO">Romania</option>
                                                    <option data-country-id="RU" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="RU">Russian Federation</option>
                                                    <option data-country-id="RW" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="RW">Rwanda</option>
                                                    <option data-country-id="RE" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="RE">Réunion</option>
                                                    <option data-country-id="BL" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="BL">Saint Barthélemy</option>
                                                    <option data-country-id="SH" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SH">Saint Helena, Ascension and Tristan da Cunha</option>
                                                    <option data-country-id="KN" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="KN">Saint Kitts and Nevis</option>
                                                    <option data-country-id="LC" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="LC">Saint Lucia</option>
                                                    <option data-country-id="MF" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="MF">Saint Martin</option>
                                                    <option data-country-id="PM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="PM">Saint Pierre and Miquelon</option>
                                                    <option data-country-id="VC" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="VC">Saint Vincent and the Grenadines</option>
                                                    <option data-country-id="WS" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="WS">Samoa</option>
                                                    <option data-country-id="SM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SM">San Marino</option>
                                                    <option data-country-id="ST" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="ST">Sao Tome and Principe</option>
                                                    <option data-country-id="SA" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SA">Saudi Arabia</option>
                                                    <option data-country-id="SN" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SN">Senegal</option>
                                                    <option data-country-id="RS" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="RS">Serbia</option>
                                                    <option data-country-id="SC" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SC">Seychelles</option>
                                                    <option data-country-id="SL" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SL">Sierra Leone</option>
                                                    <option data-country-id="SG" data-country-marketing-consent="true" data-enable-sales-tax-number="true" data-sales-tax-number-label="GST Registration Number" data-sales-tax-number-example="M12345678X" data-sales-tax-number-type="sg_gst" value="SG">Singapore</option>
                                                    <option data-country-id="SX" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SX">Sint Maarten</option>
                                                    <option data-country-id="SK" data-country-marketing-consent="false" data-vat-prefix="SK" data-vat-example="SK1234567890" data-vat-local-lang="IČ DPH" data-enable-sales-tax-number="false" value="SK">Slovakia</option>
                                                    <option data-country-id="SI" data-country-marketing-consent="false" data-vat-prefix="SI" data-vat-example="SI12345678" data-vat-local-lang="ID za DDV" data-enable-sales-tax-number="false" value="SI">Slovenia</option>
                                                    <option data-country-id="SB" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SB">Solomon Islands</option>
                                                    <option data-country-id="SO" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SO">Somalia</option>
                                                    <option data-country-id="ZA" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="ZA">South Africa</option>
                                                    <option data-country-id="GS" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="GS">South Georgia and the South Sandwich Islands</option>
                                                    <option data-country-id="SS" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SS">South Sudan</option>
                                                    <option data-country-id="ES" data-country-marketing-consent="false" data-vat-prefix="ES" data-vat-example="ES12345678X" data-vat-local-lang="NIF / CIF" data-enable-sales-tax-number="false" value="ES">Spain</option>
                                                    <option data-country-id="LK" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="LK">Sri Lanka</option>
                                                    <option data-country-id="SD" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SD">Sudan</option>
                                                    <option data-country-id="SR" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SR">Suriname</option>
                                                    <option data-country-id="SJ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SJ">Svalbard and Jan Mayen</option>
                                                    <option data-country-id="SZ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="SZ">Swaziland</option>
                                                    <option data-country-id="SE" data-country-marketing-consent="false" data-vat-prefix="SE" data-vat-example="SE123456789101" data-vat-local-lang="Momsnr." data-enable-sales-tax-number="false" value="SE">Sweden</option>
                                                    <option data-country-id="CH" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="CH">Switzerland</option>
                                                    <option data-country-id="TW" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TW">Taiwan</option>
                                                    <option data-country-id="TJ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TJ">Tajikistan</option>
                                                    <option data-country-id="TZ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TZ">Tanzania, United Republic of</option>
                                                    <option data-country-id="TH" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TH">Thailand</option>
                                                    <option data-country-id="TL" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TL">Timor-Leste</option>
                                                    <option data-country-id="TG" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TG">Togo</option>
                                                    <option data-country-id="TK" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TK">Tokelau</option>
                                                    <option data-country-id="TO" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TO">Tonga</option>
                                                    <option data-country-id="TT" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TT">Trinidad and Tobago</option>
                                                    <option data-country-id="TN" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TN">Tunisia</option>
                                                    <option data-country-id="TR" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TR">Turkey</option>
                                                    <option data-country-id="TM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TM">Turkmenistan</option>
                                                    <option data-country-id="TC" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TC">Turks and Caicos Islands</option>
                                                    <option data-country-id="TV" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="TV">Tuvalu</option>
                                                    <option data-country-id="UG" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="UG">Uganda</option>
                                                    <option data-country-id="UA" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="UA">Ukraine</option>
                                                    <option data-country-id="AE" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="AE">United Arab Emirates</option>
                                                    <option data-country-id="GB" data-country-marketing-consent="false" data-vat-prefix="GB" data-vat-example="GB123456789" data-enable-sales-tax-number="false" value="GB">United Kingdom</option>
                                                    <option data-country-id="US" data-country-marketing-consent="true" data-enable-sales-tax-number="false" data-states="Alabama|Alaska|American Samoa|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|District of Columbia|Florida|Georgia|Hawaii|Idaho|Illinois|Indianav|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming" value="US">United States</option>
                                                    <option data-country-id="UM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="UM">United States Minor Outlying Islands</option>
                                                    <option data-country-id="UY" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="UY">Uruguay</option>
                                                    <option data-country-id="UZ" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="UZ">Uzbekistan</option>
                                                    <option data-country-id="VU" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="VU">Vanuatu</option>
                                                    <option data-country-id="VE" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="VE">Venezuela, Bolivarian Republic of</option>
                                                    <option data-country-id="VN" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="VN">Vietnam</option>
                                                    <option data-country-id="VG" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="VG">Virgin Islands, British</option>
                                                    <option data-country-id="VI" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="VI">Virgin Islands, U.S.</option>
                                                    <option data-country-id="WF" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="WF">Wallis and Futuna</option>
                                                    <option data-country-id="EH" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="EH">Western Sahara</option>
                                                    <option data-country-id="YE" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="YE">Yemen</option>
                                                    <option data-country-id="ZM" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="ZM">Zambia</option>
                                                    <option data-country-id="ZW" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="ZW">Zimbabwe</option>
                                                    <option data-country-id="AX" data-country-marketing-consent="true" data-enable-sales-tax-number="false" value="AX">Åland Islands</option>
                                                </optgroup>
                                            </select>
                                        </div>
                                        <div class="form-field__error form-field__error--required">required</div>
                                    </div>
                                </div>
                            
                                <div class="form-grid__half">
                                    <div class="form-field " data-field="emailAddress">
                                        <div class="form-field__item form-field__item--text">
                                            <input id="emailAddress" class="input form-field__input input--email required" data-group="tax" name="emailAddress" type="email" required="">
                                            <label for="emailAddress" class="form-field__label form-field__label--dynamic">Email address</label>
                                        </div>
                                        <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">Email address is required</div>
                                        <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--email">Invalid Email</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-grid">
                            
                                <div class="form-grid__half">
                                    <div class="form-field" data-field="company">
                                        <div class="form-field__item form-field__item--text">
                                            <input id="company" class="input form-field__input input--text form-field__input--word-required" data-group="tax" name="company" type="text" required="">
                                            <label for="company" class="form-field__label form-field__label--dynamic">Company name</label>
                                        </div>
                                        <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">Company name is required</div>
                                        <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--word">Invalid Company name</div>
                                    </div>
                                </div>
                        
                                <div class="form-grid__half">
                                    <div class="form-field" data-field="taxField">
                                        <div class="form-field__item form-field__item--text">
                                            <input id="taxField" class="input form-field__input input--text" name="taxField" data-group="tax" type="text" placeholder="">
                                            <label id="taxFieldL" for="taxField" class="form-field__label form-field__label--dynamic">TAX ID</label>
                                        </div>
                                        <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">VAT is required</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-grid__whole">
                                    <div class="form-field" data-field="addr1Field">
                                        <div class="form-field__item form-field__item--text">
                                            <input id="addr1Field" class="input form-field__input input--text required" name="addr1Field" data-group="tax" type="text">
                                            <label for="addr1Field" class="form-field__label form-field__label--dynamic required">Address line 1 *</label>
                                        </div>
                                        <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">Address line 1 is required</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-grid">
                                <div class="form-grid__whole">
                                    <div class="form-field" data-field="addr2Field">
                                        <div class="form-field__item form-field__item--text">
                                            <input id="addr2Field" class="input form-field__input input--text" data-group="tax" name="addr2Field" type="text">
                                            <label for="addr2Field" class="form-field__label form-field__label--dynamic">Address line 2 </label>
                                        </div>
                                        <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">Address line 2 is required</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-grid" style="display: none;">
                                <div class="form-grid__whole">
                                    <div class="form-field form-field--has-value" data-field="stateField">
                                    <div class="form-field__item form-field__item--text">
                                        <select name="stateField" id="stateField" class="input form-field__input input--select" data-group="tax"></select>
                                        <!-- <input id="stateField" class="input form-field__input input--text" name="stateField" type="text"> -->
                                        <label for="stateField" class="form-field__label form-field__label--dynamic">State / Province / Region</label>
                                    </div>
                                    <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">State / Province / Region is required</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-grid">       
                                <div class="form-grid__third">
                                    <div class="form-field" data-field="cityField">
                                        <div class="form-field__item form-field__item--text">
                                            <input id="cityField" class="input form-field__input input--text form-field__input--word-required required" data-group="tax" name="cityField" type="text" required="">
                                            <label for="cityField" class="form-field__label form-field__label--dynamic">City</label>
                                        </div>
                                        <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">City is required</div>
                                    </div>
                                </div>
                            
                                <div class="form-grid__third">
                                    <div class="form-field " data-field="zipField">
                                        <div class="form-field__item form-field__item--text">
                                            <input id="zipField" class="input form-field__input input--zip" data-group="tax" name="zipField" type="text" required="">
                                            <label for="zipField" class="form-field__label form-field__label--dynamic">Zip / Postal Code</label>
                                        </div>
                                    <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">Zip / Postal Code is required</div>
                                    <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--zip">Invalid Zip code</div>
                                </div>
                            </div>
                            
                            <div class="form-grid__third">
                                <div class="form-field " data-field="coupField">
                                    <div class="form-field__item form-field__item--text">
                                        <input id="coupField" class="input form-field__input input--coup" data-group="tax" name="coupField" type="text" maxlength="20" required="">
                                        <label for="coupField" class="form-field__label form-field__label--dynamic">Discount Coupon</label>
                                    </div>
                                    <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--coup0">Invalid coupon code</div>
                                    <div aria-live="assertive" aria-relevant="additions removals" style="color:inherit;" class="form-field__error form-field__error--coup1"><span id="disf"></span> discount applied</div>
                                    <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--coup2">This coupon has expired</div> 
                                    <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--coup3">Not applicable or already used</div> 
                                    <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--coup4">This coupon is yours</div> 
                                    <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--coup5">Same vendor coupons not allowed</div> 
                                </div>
                            </div> 
                        </div>
                    </div>

                    <div class="form-grid form-grid-check">
                        <div class="form-grid__whole">
                            <div class="form-field" data-field="taxInvoice">
                                <div class="form-field__item form-field__item--option-group">
                                    <label for="taxInvoice" class="option-group-item option-group-item--block">
                                    <input id="taxInvoice" value="Y" type="checkbox" class="input input--checkbox field-gdpr" name="taxInvoice" required="">
                                    ${ __html('I need TAX invoice.') }
                                    </label>
                                </div>
                                <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">Please check the box to continue.</div>
                            </div>
                        </div>
                    </div>

                    <div class="form-grid form-grid-check">
                        <div class="form-grid__whole">
                            <div class="form-field" data-field="optField">
                                <div class="form-field__item form-field__item--option-group">
                                    <label for="optField" class="option-group-item option-group-item--block">
                                    <input id="optField" value="Y" type="checkbox" class="input input--checkbox field-gdpr" name="optField" required="">
                                    ${ __html('I agree to the Terms of Service.') }
                                    </label>
                                </div>
                                <div aria-live="assertive" aria-relevant="additions removals" class="form-field__error form-field__error--required">Please check the box to continue.</div>
                            </div>
                        </div>
                    </div>
                        
                    <button type="button" class="btn btn-payment" data-cont="Continue" data-amount="100" data-amountF="100,00" ><span class="btxt">${ document.querySelector(".btn-checkout").innerHTML }</span><span class="ld blod" style="color:#fff"></span></button>
                        
                </div>
            </div>
            `;

            d.addEventListener("scroll", function(e){  e.preventDefault(); return false; });

            // close kbox
            d.querySelector(".kbox-close-small").addEventListener('click', function(e) {

                d.querySelector('html').classList.remove("ns");
                d.querySelector(".kbox-container").remove();
            });

            // make payment
            let allow = false;
            d.querySelector(".btn-payment").addEventListener('click', function(e) {

                // validate input
                allow = true;
                for (const el of d.querySelectorAll(".form-field__input")) {

                    if(el.classList.contains('required') && el.value.length == 0){

                        if(el.dataset.group == "tax"){

                            if(document.querySelector("#taxInvoice").checked){

                                allow = false;
                                el.parentNode.parentNode.classList.add("form-field--has-error");
                                el.parentNode.parentNode.classList.add("form-field--has-required-error");
                            }
                        }else{

                            allow = false;
                            el.parentNode.parentNode.classList.add("form-field--has-error");
                            el.parentNode.parentNode.classList.add("form-field--has-required-error");
                        }
                    }else{

                        el.parentNode.parentNode.classList.remove("form-field--has-error");
                        el.parentNode.parentNode.classList.remove("form-field--has-required-error");

                        if(el.classList.contains('input--email')){

                            console.log("validating emails");
                            if(!validateEmail(el.value.trim())){
                                
                                allow = false;
                                el.parentNode.parentNode.classList.add("form-field--has-error");
                                el.parentNode.parentNode.classList.add("form-field--has-required-error");
                                el.parentNode.parentNode.querySelector('.form-field__error').innerHTML = __html('Wrong email format');
                            }
                        }
                    }
                }

                // validate email addresse
        
                // scroll into view
                if(!allow){ document.getElementById('bd').scrollIntoView(); }

                // gdpr consent
                let gdpr = d.querySelector("#optField");
                if(!gdpr.checked){
                    allow = false;
                    gdpr.parentNode.parentNode.parentNode.classList.add("form-field--has-required-error");
                }else{
                    gdpr.parentNode.parentNode.parentNode.classList.remove("form-field--has-required-error");
                }

                if(allow){

                    d.querySelector(".blod").style.display = 'inline-flex';
                    // d.querySelector(".btxt").style.display = 'none';
                    setTimeout(function(){

                        // struct data
                        self.state.checkout = {
                            fname: document.querySelector("#firstName").value.trim(),
                            lname: document.querySelector("#lastName").value.trim(),
                            email: document.querySelector("#emailAddress").value.trim(),
                            addr1: document.querySelector("#addr1Field").value.trim(),
                            addr2: document.querySelector("#addr2Field").value.trim(),
                            city: document.querySelector("#cityField").value.trim(),
                            postal: document.querySelector("#zipField").value.trim(),
                            company: document.querySelector("#company").value.trim(),
                            tax: document.querySelector("#taxField").value.trim(),
                            coup: document.querySelector("#coupField").value.trim(),
                            tax_invoice: document.querySelector("#taxInvoice").checked,
                            holders: [],
                        };

                        [...document.querySelectorAll(".holder-cont .form-grid")].forEach(form => {

                            let holder = { name: form.querySelector('[name="ticketName"]').value.trim(), email: form.querySelector('[name="ticketEmail"]').value.trim(), phone: form.querySelector('[name="ticketPhone"]').value.trim() }
                            self.state.checkout.holders.push(holder);
                        })

                        console.log(self.state.checkout);
                        // return;

                        self.initPayment();

                    }, 1200); 
                }

                e.preventDefault(); 
            });

            // init input fields
            self.initFields();
        });
    }

    initFields = () => {

        let d = document;
        const inp = d.querySelectorAll(".form-field__input");
        for (const i of inp) {
  
          i.addEventListener("focus", function(e) {
  
            this.parentNode.parentNode.classList.add("form-field--has-focus");
          });
        }
  
        for (const i of inp) {
  
          i.addEventListener("focusout", function(e) {
  
            this.parentNode.parentNode.classList.remove("form-field--has-focus");
          });
        }
  
        for (const i of inp) {
  
          i.addEventListener("change", function(e) {
  
            if (this.value.length == 0) {
              this.parentNode.parentNode.classList.remove("form-field--has-value");
            } else {
              this.parentNode.parentNode.classList.add("form-field--has-value");
            }
          });
        }
  
        // country change listener
        d.querySelector("#countryField").addEventListener("change", function(e) {
  
          // states selector
          let output = '<option data-tax-number="false" data-val="" value="">Please select</option>';
          let option = this.options[this.selectedIndex];
          let sf = d.querySelector("#stateField");
          if(typeof(option.dataset.states) !== 'undefined'){
            
            let arr = option.dataset.states.split("|");
            for(const s in arr){
  
              let opt = arr[s].split(":");
              output += '<option data-tax-number="'+((opt.length>2)?true:false)+'" data-val="'+arr[s]+'" value="'+opt[0]+'">'+opt[0]+'</option>';
            }
            sf.classList.add("required");
            sf.parentNode.parentNode.parentNode.parentNode.style.display = 'block';
          }else{
            sf.classList.remove("required");
            sf.parentNode.parentNode.parentNode.parentNode.style.display = 'none';
          }
          sf.innerHTML = output;
  
          // defaults
          d.querySelector("#taxFieldL").innerHTML = "Tax ID";
          d.querySelector("#taxField").setAttribute("placeholder", "");
  
          // vat id
          if(typeof(option.dataset.vatExample) !== 'undefined'){
            d.querySelector("#taxFieldL").innerHTML = 'EU VAT Identification Number';
            d.querySelector("#taxField").setAttribute("placeholder", option.dataset.vatExample);
          }
  
          // sales tax id
          if(typeof(option.dataset.salesTaxNumberLabel) !== 'undefined'){
            d.querySelector("#taxFieldL").innerHTML = option.dataset.salesTaxNumberLabel;
            d.querySelector("#taxField").setAttribute("placeholder", option.dataset.salesTaxNumberExample);
          }
        });
  
        // coupon change listener
        let timer = null;
        d.querySelector("#coupField").addEventListener("keyup", function(e) {
  
          // this.value = this.value.toUpperCase();
          let coupon = this.value;
          setCookie("coupon", " ", -1);
          if (timer) { clearTimeout(timer); timer = null; }
          timer = setTimeout(function(){ getCoupon(coupon); }, 2500);
        });

        // tax invoice listener
        onClick("#taxInvoice", e => {

            // e.preventDefault();
            if(e.currentTarget.checked){

                d.querySelector(".tax-cont").classList.remove('dn');
                d.querySelector(".holder-cont").style.marginBottom = "";
                
            }else{

                d.querySelector(".tax-cont").classList.add('dn');
                this.adjustHeight();
            }
        });
        
        // ticketEmail

        this.adjustHeight();
    }

    adjustHeight = () => {

        let d = document;

        let bodyWidth = d.querySelector("body").clientWidth;
        if(bodyWidth>900) d.querySelector('.popup-data').style.width = '600px';

        // adjust bottom button ofset inside checkout modal
        let qty = parseInt(d.querySelector(".num").value);
        let maxHeight = parseInt(d.querySelector("#checkout-box").clientHeight);
        let ofst = 290 + qty*112;
          
        if(maxHeight>ofst){ d.querySelector(".holder-cont").style.marginBottom = (maxHeight-ofst) + 'px'; }
    }

    initPayment = () => {

        let self = this, d = document;
         
        // block ui while loading
        if(self.state.inQuery) return; self.state.inQuery = true;

        // let query = {
        //     checkout: {
        //         type: "stripe",
        //         test: getParam('test'),
        //         data: self.state.data.event,
        //         checkout: self.state.checkout,
        //         email: self.state.checkout.holders[0].email,
        //         title: document.querySelector("#listing-title").innerHTML,
        //         description: document.querySelector('meta[name="description"]').content,
        //         images: ["https://kenzap-sites.oss-ap-southeast-1.aliyuncs.com/S"+self.state.data.event.sid+"/event-"+self.state.data.event._id+"-1-250.jpeg?"+self.state.data.event.updated],
        //         amount: parseInt(parseFloat(document.querySelector('input[name="pack-group"]:checked').dataset.price)*self.state.checkout.holders.length * 100),
        //         currency: self.state.data.event.settings.currency ? self.state.data.event.settings.currency : "USD",
        //         quantity: self.state.checkout.holders.length
        //     }
        // }
        // console.log(query); return;

        // do API query
        fetch('https://api.checkout.app.kenzap.cloud', {
            method: 'post',
            headers: H(),
            body: JSON.stringify({
                query: {
                    checkout: {
                        type: "stripe",
                        test: getParam('test'),
                        url: window.location.href,
                        // redirect: (new URL(window.location.href)).hostname,
                        data: self.state.data.event,
                        checkout: self.state.checkout,
                        variation: document.querySelector('input[name="pack-group"]:checked').dataset.box,
                        email: self.state.checkout.holders[0].email,
                        title: self.state.data.event.title + " - " + document.querySelector('input[name="pack-group"]:checked').parentNode.querySelector(".title").innerHTML,
                        description: self.state.data.event.sdesc,
                        images: ["https://kenzap-sites.oss-ap-southeast-1.aliyuncs.com/S"+self.state.data.event.sid+"/event-"+self.state.data.event._id+"-1-250.jpeg?"+self.state.data.event.updated],
                        amount: parseInt(parseFloat(document.querySelector('input[name="pack-group"]:checked').dataset.price) * 100),
                        currency: self.state.data.event.settings.currency ? self.state.data.event.settings.currency : "USD",
                        quantity: self.state.checkout.holders.length
                    }
                }
            })
        })
        .then(response => response.json())
        .then(response => {

            self.state.inQuery = false;

            d.querySelector(".blod").style.display = 'none';
            // d.querySelector(".btxt").style.display = 'inline-flex';
            
            if(response.success){

                this.state.payment_response = response;

                window.location.href = response.checkout.stripe;
            }else{

                parseApiError(response);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

    }
}