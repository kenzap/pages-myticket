// dependencies
import { __attr, __html, attr, html, parseApiError } from '@kenzap/k-cloud';
import { loadDependencies, getCookie, setCookie, getParam, priceFormat, CDN } from '../_/_helpers.js';
import { EventCheckout } from "../_/_event_checkout.js"

class kWKE7y{

    // init class
    constructor(data){
        
      this.state = {
          debug: getParam('test') ? true : false,
          firstLoad: true,
          html: '',
          data: {},
          dpi: 0,
          ajaxQueue: 0,
          limit: 25,
          responseKey: [],
          modal: null,
          modalCont: null,
          editor: {},
      };

      // call render page when all dependencies are loaded
      this.cb = () => {
  
        this.state.dpi += 1;

        // console.log(this.state.dpi);

        // execute after all dependencies loaded
        if(this.state.dpi == 3){

          // render table
          this.render();

          // listeners
          this.listeners();
        }
      };

      // cache data
      this.data = data;
      
      // init container
      this.html();

      // get dependencies
      this.dependencies();

      // render section
      this.load();
    }

    html = () => {

        document.querySelector('#content').insertAdjacentHTML('beforeend', 
        `
        <section id="${ attr(this.data.id) }" class="kWKE7y ${ this.data.c.classes ? attr(this.data.c.classes) : '' }" style="${ this.data.c.section };${ this.data.borderstyle.value ? '--borderStyle:'+this.data.borderstyle.value+'px;' : '' }">
            <div class="container" style="${ this.data.c.container }">
  

            </div>
        </section>
        `
        );
    }

    load = () => {

        let self = this;

        let s = "";

        // do API query
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
                query: {
                    locale: {
                        type:       'locale',
                        id:         getCookie('lang')
                    },
                    event: {
                        type:       'view-event',
                        id:         getParam('id'),
                    }
                }
            })
        })
        .then(response => response.json())
        .then(response => {

            if(response.success){

                this.state.response = response; 

                this.cb();

                // first load
                this.state.firstLoad = false;

            }else{

                if(response.code == 400){

                    document.querySelector('#' + this.data.id + ' .container').innerHTML = html('Please provide valid event id to load this page.');
                    
                    return;
                }

                parseApiError(response);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // render class html
    render = () => {

      let event = this.state.response.event;

      // set page title 
      document.title = this.state.response.event.title;
      
      console.log(this.state.response);
      
      document.querySelector('#' + this.data.id + ' .container').innerHTML =
        `
        <div class="two-columns">
          <div class="content pl10">
              <ul id="lightSlider">
                  ${
                      // https://kenzap-sites.oss-ap-southeast-1.aliyuncs.com/S1000000/event-c9aa81de0d8ba4bd958c6d83e0c533ec8dce8d76-1-100x100.jpeg?1677091677
                      event.img.map((img, i) => {

                          return (img == true ?
                          `
                              <li data-thumb="${ CDN+'/S'+event.sid+'/event-'+event._id+'-'+(parseInt(i)+1)+'-250.webp?' + event.updated }">
                                  <img src="${ CDN+'/S'+event.sid+'/event-'+event._id+'-'+(parseInt(i)+1)+'-500.webp?' + event.updated }" alt="" width="550" height="auto" />
                              </li>    
                          ` : ``)                 

                      }).join('')
                  }

              </ul>
              <div class="social-holder">
                  <span class="title">Share this listing:</span>
                  <ul class="social-links">
                      <li>
                          <a href="#fb">
                              <i class="fa fa-facebook-f"></i>
                          </a>
                      </li>
                      <li>
                          <a href="#tw">
                              <i class="fa fa-twitter"></i>
                          </a>
                      </li>
                      <li>
                          <a href="#ld">
                              <i class="fa fa-linkedin"></i>
                          </a>
                      </li>
                      <li>
                          <a href="#em">
                              <i class="fa fa-envelope"></i>
                          </a> 
                      </li>
                  </ul>
              </div>
          </div>
          <aside class="aside">
              <h1 id="listing-title">${ html( event.title ? event.title : "" ) }</h1>
              <div class="meta">
                  <div class="object-img">
                      <img src="https://cdn.kenzap.com/loading.png" alt="">
                  </div>
                  <a href="${ html( event.vendor ? event.vendor.link : "#" ) }" class="btn-chat">
                      <i class="fa fa-comment"></i>
                      ${ __html( 'Follow' ) }
                  </a>
                  <div class="text">
                      <strong class="title">${ html( event.vendor ? event.vendor.name : "" ) }</strong>
                      <div class="holder">
                          <div class="country-flag">
                              <img src="https://cdn.kenzap.com/flag/sg.svg" alt="">
                          </div>
                          <fieldset class="rating">
                              <input type="radio" id="star5" name="rating" value="5" checked />
                              <label class = "full" for="star5" title="Awesome - 5 stars"></label>
                              <input type="radio" id="star4half" name="rating" value="4 and a half"  checked />
                              <label class="half" for="star4half" title="Pretty good - 4.5 stars"></label>
                              <input type="radio" id="star4" name="rating" value="4" />
                              <label class = "full" for="star4" title="Pretty good - 4 stars"></label>
                              <input type="radio" id="star3half" name="rating" value="3 and a half" />
                              <label class="half" for="star3half" title="Meh - 3.5 stars"></label>
                              <input type="radio" id="star3" name="rating" value="3" />
                              <label class = "full" for="star3" title="Meh - 3 stars"></label>
                              <input type="radio" id="star2half" name="rating" value="2 and a half" />
                              <label class="half" for="star2half" title="Kinda bad - 2.5 stars"></label>
                              <input type="radio" id="star2" name="rating" value="2" />
                              <label class = "full" for="star2" title="Kinda bad - 2 stars"></label>
                              <input type="radio" id="star1half" name="rating" value="1 and a half" />
                              <label class="half" for="star1half" title="Meh - 1.5 stars"></label>
                              <input type="radio" id="star1" name="rating" value="1" />
                              <label class = "full" for="star1" title="Sucks big time - 1 star"></label>
                              <input type="radio" id="starhalf" name="rating" value="half" />
                              <label class="half" for="starhalf" title="Sucks big time - 0.5 stars"></label>
                          </fieldset>
                      </div>
                  </div>
              </div>
              <form action="#" class="">
                  <div class="package-area">
                      ${
                          event.variations.map((box, i) => {

                              return `

                              <div class="box ${ box.type == 'hidden' ? 'dn':'' }">
                                  <input type="radio" id="box${i}" data-box="${i}" data-price="${ box.price }" data-soldout="${ box.type == 'soldout' ? 'soldout' : (parseInt(box.stock) - parseInt(box.booked ? box.booked : 0)) == 0 ? 'soldout' : '' }" name="pack-group" ${ i == 0 ? 'checked' : '' } >
                                  <label for="box${i}">
                                      <span class="price">${ priceFormat(event, box.price) }</span>
                                      <strong class="title">${ box.title }</strong>
                                      ${ 
                                          box.type == 'soldout' ? `<p class="sold-out" style="color:var(--baseColorA);">${ __html('This package is sold out') }</p>` 
                                          : 
                                          (parseInt(box.stock) - parseInt(box.booked ? box.booked : 0)) < 10 
                                          ?
                                          `<p style="color:var(--baseColorA);">${ __html('%1$ tickets left at this price', parseInt(box.stock) - parseInt(box.booked ? box.booked : 0)) } </p>`
                                          :
                                          `
                                          `
                                      }
                                      <p>
                                      <i class="fa fa-calendar"></i>
                                      &nbsp;${ new Date(event.eventbegins).toLocaleDateString() + " " + new Date(event.eventbegins).toLocaleTimeString().slice(0,5) }
                                      </p>
                                      <hr>
                                      ${ box.features.split('\n').map((feature) => {

                                          return feature.length ? 
                                              `<ul class="skills">
                                                  <li>
                                                    <svg width="18px" height="13px" viewBox="0 0 18 13" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                                    <!-- Generator: Sketch 63.1 (92452) - https://sketch.com -->
                                                    <title>Tick-icon-white</title>
                                                    <desc>Created with Sketch.</desc>
                                                    <g id="Kenzap-Service-Page" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                                        <g id="Service-Desktop" transform="translate(-1476.000000, -465.000000)" fill="var(--baseColorA)">
                                                            <g id="SERVICE-DETAIL" transform="translate(0.000000, 110.000000)">
                                                                <g id="Packages" transform="translate(1173.000000, 60.000000)">
                                                                    <g id="Package" transform="translate(4.000000, 260.000000)">
                                                                        <g id="01">
                                                                            <g id="Select" transform="translate(293.000000, 26.000000)">
                                                                                <g id="Tick-icon-white" transform="translate(6.000000, 9.000000)">
                                                                                    <g id="Tick-icon">
                                                                                        <path d="M17.7363944,0.259254149 C17.3849378,-0.0864180498 16.815126,-0.0864180498 16.463599,0.259254149 L5.68104971,10.8633833 L1.53641414,6.7873694 C1.18495754,6.4416972 0.615145733,6.44173177 0.263618819,6.7873694 C-0.0878729396,7.13300702 -0.0878729396,7.6933846 0.263618819,8.0390568 L5.04465205,12.7408625 C5.39600318,13.0865002 5.96623686,13.0862581 6.31744737,12.7408625 L17.7363944,1.51097612 C18.0878861,1.1653385 18.087851,0.604926348 17.7363944,0.259254149 Z" id="Path" fill-rule="nonzero"></path>
                                                                                    </g>
                                                                                </g>
                                                                            </g>
                                                                        </g>
                                                                    </g>
                                                                </g>
                                                            </g>
                                                        </g>
                                                    </g>
                                                </svg>
                                               ${ feature }</li>
                                              </ul>
                                              `
                                              :
                                              ` `
                                              
                                      }).join('') }
                                  </label>
                              </div>

                              `;

                          }).join('')
                      }

                      ${ event.variations.length == 0 ? `<div><br>${ __html('no available packages for sale.') }</div>` : '' }
                  </div>
                  <div class="qty-area ">
                      <div class="holder">
                          <span class="title">${ __html('qty:') }</span>
                          <input type="number" class="num" id="1" value="1" min="1" max="3" />
                          <button type="button" id="add" class="add">+</button>
                          <button type="button" id="sub" class="sub">-</button>
                      </div>
                  </div>
                  <button type="submit" class="btn btn-checkout ${ event.variations.length == 0 ? 'dn' : '' }" data-kbox data-cont="${ __html('Continue') }" data-src="#checkout-box" href="javascript:;">${ __html('Continue') }</button>
                  <div class="btn-area">
                      <button type="submit" class="btn-wish" data-add_wishlist="${ __attr('Add to favorites') }" data-rem_wishlist="${ __attr('Remove from favorites') }">
                          <i class="fa fa-heart-o"></i>
                          ${ __html('Add to wishlist') }
                      </button>
                  </div>
              </form>
          </aside>
        </div>

        <div class="info-area">
            <div class="two-columns">
                <div class="content">
                    <hr>
                    <ul class="tabset">
                        <li><a href="#tab1" class="active">${ __html('DESCRIPTION') }</a></li>
                        <li class="dn"><a href="#tab2">${ __html('REVIEWS') }</a></li>
                        <li class="dn"><a href="#tab3">${ __html('FAQS') }</a></li>
                    </ul>
                    <div class="tab-content">
                        <div id="tab1">
                        <div class="tab-text">
                        
                            ${ event.ldesc ? event.ldesc : "" }

                            <div class="event-map">
                                <iframe width="100%" height="500" id="gmap_canvas" src="https://maps.google.com/maps?q=${ encodeURIComponent(event.eventlocation) }&t=&z=11&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe>
                            <div>
                        </div>

                        </div>
                        <div id="tab2" class="dn">${ __html('REVIEWS tab') }</div>
                        <div id="tab3" class="dn">>${ __html('FAQS tab') }</div>
                    </div>
                </div>
                <aside class="aside">
                    &nbsp;
                </aside>
            </div>
        </div>

        <div id="checkout-box" class="kbox saved-list" >
          <form action="#">
            <div class="popup-data">
                <div class="header">
                    <h2>Checkout</h2>
                </div>
                <div class="content-area">
                    <div class="content">
                        
                    </div>
                </div>
            </div>
            </form>
            <button data-kbox-close="" class="kbox-close-small">×</button>
        </div>
      `;

      // load vendor image
      let i = new Image();
      i.onload = () => {
          document.querySelector('.object-img img').setAttribute('src', CDN+'/S'+event.sid+'/event-'+event._id+'-vendor-logo-100x100.webp?' + event.updated);
      };
      i.src = CDN+'/S'+event.sid+'/event-'+event._id+'-vendor-logo-100x100.webp?' + event.updated;

      // Instantiate EasyZoom instances
      var $easyzoom = $('.easyzoom').easyZoom();

      // Setup thumbnails example
      var api1 = $easyzoom.filter('.easyzoom--with-thumbnails').data('easyZoom');

      $('.thumbnails').on('click', 'a', function(e) {
          var $this = $(this);

          e.preventDefault();

          // Use EasyZoom's `swap` method
          api1.swap($this.data('standard'), $this.attr('href'));
      });

      // Setup toggles example
      var api2 = $easyzoom.filter('.easyzoom--with-toggle').data('easyZoom');

      $('.toggle').on('click', function() {
          var $this = $(this);

          if ($this.data("active") === true) {
          $this.text("Switch on").data("active", false);
          api2.teardown();
          } else {
          $this.text("Switch off").data("active", true);
          api2._init();
          }
      });
  
      $('#lightSlider').lightSlider({
          gallery: true,
          item: 1,
          loop:true,
          slideMargin: 30,
          thumbItem: 5,
          responsive : [
              {
                  breakpoint:767,
                  settings: {
                      thumbItem: 3,
                      slideMargin: 40,
                      }
              },
          ]
      });
      
    }

    // all listeners and events
    listeners = () => {

      let self = this;

      let d = document;

      // prevents listeners to be assigned twice
      if(!self.state.firstLoad) return;

      self.state.checkout = new EventCheckout(this.state, this.data.id, this.data.sid);

      // qty add
      let qty = d.querySelector(".qty-area .num");
      d.querySelector(".add").addEventListener('click', function(e) {
          let n = parseInt(qty.value);
          if (n < 300) { qty.value = n + 1 }
          self.refreshPrice(true);
      });

      // qty deduct
      d.querySelector(".sub").addEventListener('click', function(e) {
          let n = parseInt(qty.value);
          if (n > 1) { qty.value = n - 1 }
          self.refreshPrice(true);
      });

      // boxes
      let ll = d.querySelectorAll(".box"); 
      for (const l of ll){
          l.addEventListener('click', function(e) {

              let el = this;
              setTimeout(function(){

                  el.querySelector("input").checked = true;

                  self.refreshPrice(true);
              },10);
              e.preventDefault();
          });
      }

      self.refreshPrice(true);

      // add/remove wishlist
      self.btnWishlistRef(false);
      d.querySelector(".btn-wish").addEventListener("click", function(e) { self.btnWishlistRef(true); e.preventDefault(); });

      // share buttons
      const links = d.querySelectorAll(".social-links li a");
      for (const l of links){

          l.addEventListener("click", function(e) {

              switch(this.getAttribute('href')){

                  case '#fb':
                      var fb = window.open("https://www.facebook.com/sharer/sharer.php?u="+window.location.href, "pop", "width=600, height=400, scrollbars=no");
                  break;
                  case '#tw':
                      var fb = window.open("http://twitter.com/share?url="+window.location.href+"&text="+d.title, "pop", "width=600, height=400, scrollbars=no");
                  break;
                  case '#ld':
                      var fb = window.open("https://www.linkedin.com/sharing/share-offsite/?url="+window.location.href, "pop", "width=600, height=400, scrollbars=no");
                  break;
                  case '#em':
                      window.location.href = "mailto:?subject="+encodeURIComponent(d.title)+"&body="+encodeURIComponent("Check this event " + window.location.href);
                  break;
              }
              return false;
              e.preventDefault();
          });
      }
    }

    // refresh button state
    btnWishlistRef = (revert) => {

      let d = document;
      let oidc = 'o'+this.state.response.event._id;
      let temp = getCookie("favorites");
      if(revert){

          if(!temp.includes(oidc)){
              temp += oidc+"|";
              setCookie("favorites", temp, 100); 
              revert = true;
          }else if(temp.includes(oidc)){
              temp = temp.replace(oidc+"|", "");
              setCookie("favorites", temp, 100); 
              revert = false;
          }
      }else{
          revert = temp.includes(oidc); 
      }

      if(revert){
          d.querySelector(".btn-wish").innerHTML = '<i class="fa fa-heart"></i>'+d.querySelector(".btn-wish").dataset.rem_wishlist;
      }else{
          d.querySelector(".btn-wish").innerHTML = '<i class="fa fa-heart-o"></i>'+d.querySelector(".btn-wish").dataset.add_wishlist;
      }
    }

    refreshPrice = (t) => {

      let d = document;
      let pb = d.querySelector('input[name="pack-group"]:checked');
      if(!pb) return;

      let qty = parseInt(d.querySelector(".num").value);
      let price = pb.dataset.price*qty;
      let btn = d.querySelector(".btn-checkout");
      btn.setAttribute('data-price', price);
      btn.innerHTML = btn.getAttribute('data-cont') + ' <span>(' + priceFormat(this.state.response.event, price) + ')</span>';
      // btn.dataset.link = "https://pay.kenzap.com/B"+oid+"P"+pb.dataset.box+"P"+qty+"/";

      // package variation
      switch(t){
          // normal package
          case true: 

              d.querySelector(".qty-area").style.display = "block";
          break;
          // custom package
          case false: 

              d.querySelector(".qty-area").style.display = "none";
              return;
          break;
      }

      // refreshOfferUrl();
    }

    doCheckout = (e) => {

      e.preventDefault();
    }

    // sync html with data
    cache = () => {

      localStorage.setItem(this.id, JSON.stringify(this.state));
    }

    /**
     * Parse start rating
     * @public
     * @param {Integer} i - for id 
     * @param {Integer} rating - amount of full stars
     * @returns {Node} rendered HTML 
     */
    stars = (i, rating) => {

        // console.log("a"+rating);
        let output = '';
        output += '\
        <fieldset class="rating">\
            <input type="radio" name="'+i+'rrr" '+((rating>4.5 && rating<=5)?"checked":"")+' value="5"><label class="full" for="star5" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>4.0 && rating<=4.5)?"checked":"")+' value="4 and a half"><label class="half" for="star4half" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>3.5 && rating<=4.0)?"checked":"")+' value="4"><label class="full" for="star4" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>3.0 && rating<=3.5)?"checked":"")+' value="3 and a half"><label class="half" for="star3half" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>2.5 && rating<=3.0)?"checked":"")+' value="3"><label class="full" for="star3" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>2.0 && rating<=2.5)?"checked":"")+' value="2 and a half"><label class="half" for="star2half" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>1.5 && rating<=2.0)?"checked":"")+' value="2"><label class="full" for="star2" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>1.0 && rating<=1.5)?"checked":"")+' value="1 and a half"><label class="half" for="star1half" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>0.5 && rating<=1.0)?"checked":"")+' value="1"><label class="full" for="star1" ></label>\
            <input type="radio" name="'+i+'rrr" '+((rating>0 && rating<=0.5)?"checked":"")+' value="half"><label class="half" for="starhalf" ></label>\
        </fieldset>\
        ';
        return output;
    }

    dependencies = () => {

        let self = this;

        // can not start rendering without jquery
        loadDependencies('https://static.kenzap.com/libs/jquery-1.11.0.min.js', () => {
  
            loadDependencies('https://static.kenzap.com/libs/lightslider-1.1.5.css', self.cb);
            loadDependencies('https://static.kenzap.com/libs/lightslider-1.1.5.js', self.cb);
            loadDependencies('https://static.kenzap.com/libs/easyzoom-2.4.0.js', self.cb);
        });
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

window.kWKE7y = kWKE7y;