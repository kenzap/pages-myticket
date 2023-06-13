// dependencies
import { H, __attr, __html, attr, html, onClick, setCookie, getCookie, parseApiError, spaceID, onChange } from '@kenzap/k-cloud';
import { priceFormat, getParam, CDN } from '../_/_helpers.js';
import { Checkout } from "../_/_checkout.js"

// export const CDN = 'https://kenzap-sites.oss-ap-southeast-1.aliyuncs.com';

export class Layout{

    // init class
    constructor(data, state){
    
        this.state = state;
        this.data = data;

        this.init();
    }

    init = () => {

        let hall = this.state.hall_js;
        let img = document.querySelector("#myticket_img");
        let kp_svg = document.querySelector(".kp_svg");
        let i = 0;
        img.style.position = 'absolute';

        // find scale factor
        let polygon_scale = hall.img_width / parseInt(this.state.dwidth);
        
        // set up layout proportions with the browsers screen
        let mwidth = img.width;
        let mheight = img.height;
        document.querySelector("#kp_image").style.width = mwidth;
        document.querySelector("#svg").style.width = mwidth;
        document.querySelector("#svg").style.height = mheight;
        polygon_scale = hall.img_width / parseInt(mwidth);
        
		// set timer
		this.state.myticketCalls = setInterval(this.checkReservations, 5000, true);

        // console.log(polygon_scale); 

        // switch layout rendering scenarious
        switch(this.data.rendertype.value){

            // mode 1 overlay hall layout image with interactive seat polygons
            case 'seat':

                hall.areas.map((item, z) => {

                    // map seats
                    let tws = 0;
                    if (hall.areas[z].seats){
            
                        // total seats per zone
                        tws = hall.areas[z].seats.tws;
            
                        // seat size
                        if(typeof(hall.areas[z].seats.height) === 'undefined') hall.areas[z].seats.height = 100; 
                        let height = parseFloat(hall.areas[z].seats.height) / polygon_scale / 2;
                        let s = 0;
                        while (s < tws){
            
                            // // seat default coordinates
                            // let x = 0;
                            // let y = 0;
            
                            // prevent undefined js error
                            if(!hall.areas[z].seats.points) hall.areas[z].seats.points = [];
            
                            // get central point 
                            let x = 0, y = 0, xc = 0, yc = 0, i = 0, x_start = 99999, y_start = 99999;
                            let cp = hall.areas[z].coords.points.map(function(item) {

                                if(x_start > item.x) x_start = item.x;
                                if(y_start > item.y) y_start = item.y;
                                i++;
                                x += item.x; y += item.y;
                                return item;
                            });
                        
                            // calc all x and y coords separately. Divide by the total amount of coords to find central point
                            xc = x / i;
                            yc = y / i;

                            // get mapped seat coordinates and align them accordingly
                            if ( hall.areas[z].seats.points[s] ){
            
                                x = xc / polygon_scale + (hall.areas[z].seats.points[s].x) / polygon_scale;
                                y = yc / polygon_scale + (hall.areas[z].seats.points[s].y) / polygon_scale;
                            }
            
                            // get seat HTML
                            let seat = structSeat(hall, z, s, height, x, y);
            
                            // add seat to hall layout canvas
                            seat.g.obj = this;
                            kp_svg.append(seat.g);

                            // svg_mapping.append(seat.g);
                            s++;
                        }
                    }
                    
                    i++;
                });

            break;
            // mode 0 overlay hall layout image with interactive zone polygons
            case 'zone':

                // hall_js.passes = {};
                hall.areas.map((item, z) => {

                    // generate DOM elements
                    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

                    // draw zone overlay polygon 
                    polygon.setAttribute('points', item.coords.points.map(function(item) { return item.x / polygon_scale + " " + item.y / polygon_scale; }));
                    polygon.setAttribute('data-index', i);
                    polygon.setAttribute('id', "pl"+i);
                    g.appendChild(polygon);
                    // console.log(g);
                    kp_svg.append(g);
                    i++;

                    var tns = 0, tws = 0; 
                    
                    // populate passes array
                    if (hall.areas[z].seats){

                        // total seats per zone
                        tns = parseInt(hall.areas[z].seats.tns);
                        tws = parseInt(hall.areas[z].seats.tws);

                        if(hall.areas[z].passes === undefined) hall.areas[z].passes = [];

                        var s = 0;
                        while (s < tns){

                            // if(hall_js.passes[z].seats === undefined) hall_js.passes[z].seats = [];
                            // hall_js.passes[z].seats.push({id: "p"+(s+tws)+'z'+z, uid: "", class: ""});
                            hall.areas[z].passes.push({id: "p"+parseInt(s+tws)+'z'+z, uid: "", class: ""});
                            s++;
                        }
                    }

                    // fade in
                    document.querySelector("#kp_image").style.opacity = '1';
            
                    return item;
                });

                // mode 0 add layout zone seat preview event
                onClick("polygon", e => {

                    let z = e.currentTarget.dataset.index;

                    this.state.current_zone_id = z;

                    // ignore clicks if zone is fully booked
                    if(!e.currentTarget.classList.contains("booked")){

                        // single click full zone reservation mode
						// console.log(hall.areas[z])
						if(!hall.areas[z].seats){

							this.reserveZoneIntent(z);

                        }else if(hall.areas[z].seats.tws == 0 && hall.areas[z].seats.tns == 1){

                            this.reserveZoneIntent(z);

                        // seat selection moda;
                        }else{

                            this.showSeats(z);
                        }
                    }
                });

            break;
        }

        // restore sumary table after refresh
        this.refreshSelectedTicket();

		// get latest reservations
		this.checkReservations();
    }

	// reserve unreserve full zone
	reserveZone = (z) => {

		// var tns = hall.areas[z].seats.tns;
		let hall = this.state.hall_js;
		// let ticket_id = '0z'+z;

		// get reserved tickets
		let reserved = this.state.tickets.filter(t => t.zone_id == z);
		// let reserved = jQuery.grep(tickets_global, function(value) {
		// 	return value.zone_id == z
		// });

		console.log(reserved);

		// unreserve
		if(reserved.length == 1){  

			console.log('unreserve');

			// remove zone from tickets
			this.state.tickets_release = [...this.state.tickets_release, ...this.state.tickets.filter(t => (t.zone_id == z))];
			this.state.tickets = this.state.tickets.filter(t => !(t.zone_id == z));
			// tickets_global = jQuery.grep(tickets_global, function(value) {
			// 	return !(value.zone_id == z);
			// });

			// mark zone as free instantly 
			document.querySelector("#pl"+z).classList.remove('selected');
			// $("#pl"+z).removeClass("selected");

			// return;

		// reserve	
		}else{

			// check if not exceeding max allowed 
			if(this.state.tickets.length >= this.state.ticketspbooking){

				alert( __html('Adding more tickets is not allowed') )
				return;
			}
			
			// if(tickets_global.length>=parseInt($(khl).data("ticketspbooking"))){
			// 	alert($(khl).data("ajax_max_tickets"));
			// 	return;
			// }

			// zone is not assigned skip reservation request
			if(!hall.areas[z].seats) hall.areas[z].seats = { title: __html('Zone %1$', z), tws: 0, tns: 1, price: this.state.price }

			// set ticket object defaults
			// let ticket_text = 1, ticket_row = '', ticket_price = '', zone_text = hall.areas[z].seats.title;
			// if(hall.areas[z].seats.price) ticket_price = hall.areas[z].seats.price;
			// if(p!='') ticket_price = p;
			// if(ticket_row=='') ticket_row = zone_text

			// structure ticket object 
			let obj = { id: 'z'+z, zone_id: parseInt(z), title: hall.areas[z].seats.title, price: hall.areas[z].seats.price ? hall.areas[z].seats.price : this.state.price, cfs: hall.cfs, type: "zone", render: this.data.rendertype.value };

			// pass additional data to the ticket object such as price, custom fields, seat information 
			Object.keys(hall.areas[z].seats).map((key, index) => {
				
				// exclude seats key as it contains large data sets of unrelated data
				if(!this.state.exclude.includes(key)){ obj[key] = hall.areas[z].seats[key]; }
			});
	
			// obj['price'] = ticket_price;
			
			// push object to ticket global array
			this.state.tickets.push(obj);
			
			// mark zone as reserved instantly
			document.querySelector("#pl"+z).classList.add('selected');
			// $("#pl"+z).addClass("selected");
		}

		this.refreshSelectedTicket();

		this.state.current_zone_id = -1;
	}

    reserveZoneIntent = (z) => {

        console.log(this.state.ticketspbooking + 'zone:' + z);
		let hall = this.state.hall_js;

        // check if already reserved
        let reserved = this.state.tickets.filter(t => t.zone_id == z);

        // unreserve zone and finish here
        if(reserved.length == 1){

            this.reserveZone(z);
            return;
        }

        // check if not exceeding max allowed 
        if(this.state.tickets.length >= this.state.ticketspbooking){

            alert( __html('Adding more tickets is not allowed') )
            return;
        }

        // check for variations
        if(!hall.pcfs) hall.pcfs = [];
        let pcfshtml = '';
        for(let pv of hall.pcfs){

            if(hall.areas[z].seats['pcf'+pv.index]) pcfshtml += '\
            <li>\
                <input value="'+hall.areas[z].seats['pcf'+pv.index]+'" data-label="'+pv.label+'" type="radio" id="pvar-'+pv.index+'" name="selector">\
                <label for="pvar-'+pv.index+'">' + pv.label + ' (' + priceFormat(this.state.response.event, hall.areas[z].seats['pcf'+pv.index]) + ') </label>\
                <div class="check"></div>\
            </li>';
            
            // console.log(hall.areas[z].seats['pcf'+pv.index]);
        }

        // load price variation picker
        if(pcfshtml){

			document.querySelector('#variation_cont_zone ul.pvar').innerHTML = pcfshtml;
            // $("#variation_cont_zone ul.pvar").html(pcfshtml);

            // assign variation listeners
			onChange('#variation_cont_zone ul.pvar input[type=radio]', e => {
				  
				// self.reserveSeat(ticket_id, z, s, e.currentTarget.value, e.currentTarget.dataset.label);

				document.querySelector('#variation_cont_zone').style.display = 'none';
			});
            // $("#variation_cont_zone ul.pvar input[type=radio]").change(function() {

            //     // reserveZone(z, hall_js, this.value, this.dataset.label);

            //     $("#variation_cont_zone").fadeOut();
            //     // alert(this.value);
            //     // reserveSeat(hall, ticket_id, z, s, this.value, this.dataset.label);
            // });

			document.querySelector('#variation_cont_zone').style.display = 'block';
            // $("#variation_cont_zone").fadeIn();

            // user asks to close
			onClick('.var_toolbar_close .times', e => {

				document.querySelector('#variation_cont_zone').style.display = 'none';
			});
            // $(".var_toolbar_close .times").click(function() { $("#variation_cont_zone").fadeOut(); });

        }else{

            this.reserveZone(z);
        }
    }

    reserveSeat = (ticket_id, z, s, p, t) => {

		let hall = this.state.hall_js;

		// add ticket
		if(!document.querySelector('#c'+ticket_id).classList.contains('reserved')){
        // $("#c"+ticket_id).hasClass("reserved")){

			if(this.state.tickets.length > parseInt(this.state.ticketspbooking)){

                alert( __html('Adding more tickets is not allowed') );
				// alert($(khl).data("ajax_max_tickets"));
				return;
			}

			// let ticket_text = parseInt(s) + 1;
			let ticket_price = '';
			let zone_text = hall.areas[z].seats.title;

			// if(hall.areas[z].seats.points[s].t)
			// 	ticket_text = hall.areas[z].seats.points[s].t;
				
			// if(hall.areas[z].seats.points[s].r)
			// 	ticket_row = hall.areas[z].seats.points[s].r;

			// default package listing price
			ticket_price = this.state.price;

			// zone price
			if(hall.areas[z].seats.price)
				ticket_price = hall.areas[z].seats.price.trim();

			// price picker price
			if(!isNaN(p)) ticket_price = p;

			// individal seat seat price
			if(!isNaN(hall.areas[z].seats.points[s].p))
				ticket_price = hall.areas[z].seats.points[s].p.trim();

			// structure ticket object 
			let obj = { id: 's'+s, zone_id: parseInt(z), zone_text: zone_text, path: 'z'+z+'s'+s, seat_id: parseInt(s), seat_text: (hall.areas[z].seats.points[s].t ? hall.areas[z].seats.points[s].t : s)  + (t ? ' / ' + t : ''), seat_row: hall.areas[z].seats.points[s].r ? hall.areas[z].seats.points[s].r : '', price: ticket_price, cfs: hall.cfs, type: "seat", render: this.data.rendertype.value };

			// console.log(obj);

			// pass additional data to the ticket object such as price, custom fields, seat information 
			Object.keys(hall.areas[z].seats).map((key, index) => {
				
				// exclude seats key as it contains large data sets of unrelated data
				if(!this.state.exclude.includes(key)){ obj[key] = hall.areas[z].seats[key]; }
			});

			// ticket_obj['price'] = ticket_price;
			this.state.tickets.push(obj);

			// hide price variation cont
            document.querySelector('body').classList.remove('pvarshow');
			// $("body").removeClass('pvarshow');

		// unreserve seat
		}else{

            document.querySelector('#c'+ticket_id).classList.remove('reserved');
			this.state.tickets_release = [...this.state.tickets_release, ...this.state.tickets.filter(t => (t.path == 'z'+z+'s'+s))];
            this.state.tickets = this.state.tickets.filter(t => !(t.path == 'z'+z+'s'+s));
			
			// $("#c"+ticket_id).removeClass("reserved");
			// tickets = jQuery.grep(tickets, function(value) {
			// 	return !(value.ticket_id == ticket_id);
			// });
		}

		// refresh top bar tickets
		this.refreshSelectedTicket();
	}

    // popup window to pick up seat from the zone
	showSeats = (z) => {

        document.querySelector('#' + this.data.id).insertAdjacentHTML('afterbegin', 
        `
        <div id="seat_mapping" class="seat_mapping_temp" style="--mc:#ff6600;--avc:#b1e2a5;--avc2:rgba(177,226,165,0.5);--soc:#afc3e5;--soc2:rgba(175,195,229,0.5);--sec:#f78da7;--sec2:rgba(247,141,167,0.5);">
            <div id="top_toolbar">
                <div id="seat_mapping_close">${ __html('Confirm') }</div>
                <div id="seat_mapping_cancel"><span class="txt">back</span><span class="times"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg></span>
                </div>
            </div>
            <div id="seat_size" class="seat_head">
                <div class="row1">

                </div>
                <div class="row2">
                    <div class="selected_seats"></div>
                </div>
            </div>
            <!-- number of seat picker without reservation -->
            <div id="svg_number_cont">
                <div id="picker_cont" >
                    <div class="picker_cont_inner" >
                        <h2>${ __html('Number of tickets') }</h2>
                        <div>
                            <select type="text" class="picker_select">

							</select>
                        </div>
                        <p>${ __html('Note! You are selecting standing tickets without seat reservation.') }</p>
                    </div>
                </div>
            </div>
            <!-- seat reservation inside zone -->
            <div id="svg_mapping_cont">
                <svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" id="svg_mapping" class="noselect"> </svg>
                <div id="variation_cont" class="variation_cont" >
                    <div class="variation_cont_inner" >
                        <h2>${ __html('Ticket type') }</h2>
                        <div>
                            <ul class="pvar">

                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `);

		// $("body").prepend($("#seat_mapping").clone().addClass("seat_mapping_temp"));

		let svg_mapping = document.querySelector("#svg_mapping");
		let svg_number_cont = document.querySelector("#svg_number_cont");
		let svg_mapping_cont = document.querySelector("#svg_mapping_cont");
		let svg_width = window.innerWidth - 200;
		let svg_height = window.innerHeight - 200;
		let hall = this.state.hall_js;

		if(svg_width < this.state.sminwidth)
			svg_width = this.state.sminwidth;
		if(svg_width > this.state.smaxwidth)
			svg_width = this.state.smaxwidth;
		if(svg_height < 600)
			svg_height = 600;
		
		this.state.current_zone_id = z;
		this.state.pending_reservations = true;

        // console.log(this.state.current_zone_id);
		// checkReservations();


		// $("#seat_mapping").fadeIn();
		// svg_mapping.html("");

		// reset picker if exists
		// $(".picker_select").removeClass('rendered');

		// get central point 
		let x = 0, y = 0, xc = 0, yc = 0, i = 0;
		let cp = hall.areas[z].coords.points.map(function(item) {

			i++; x += item.x; y += item.y;
			return item;
		});

		// calc all x and y coords separately. Divide by the total amount of coords to find central point
		xc = x / i;
		yc = y / i;

		// get relative distance from coords to center point
		var il = 0, yl = 0, xl = 0, max_times = 1;
		hall.areas[z].coords.points_rel = [];
		cp = hall.areas[z].coords.points.map(function(item) {

			var temp = Math.abs(xc - item.x);

			// find longest coordinates
			temp = Math.abs(xc - item.x);
			xl = temp > xl ? temp : xl;
			temp = Math.abs(yc - item.y);
			yl = temp > yl ? temp : yl;
			
			// store central points
			hall.areas[z].coords.points_rel.push({x : item.x - xc, y : item.y - yc});
		}); 

		// detect how many times original poligon can be enlarged
		svg_mapping.style.width = svg_width; // css("width",svg_width);
		svg_mapping.style.height = svg_height; // css("height",svg_height);

		// get max scalability, calculate based on screen viewport
		var max_x = (svg_width/2) / xl;
		var max_y = (svg_height/2) / yl;
		max_times = max_x < max_y ? max_x : max_y; 

		// generate scaled polygon points
		max_x = 0; max_y = 0;
		var max_x_prev = 0, max_y_prev = 0, max_first = true;
		var polygonPointsAttrValue = hall.areas[z].coords.points_rel.map(function(item) {

			var px = item.x * max_times + (svg_width/2);
			var py = item.y * max_times + (svg_height/2);

			if ( !max_first ){
				max_x += max_x_prev * item.y * max_times;
				max_y += max_y_prev * item.x * max_times;
			}

			max_x_prev = item.x * max_times;
			max_y_prev = item.y * max_times;

			max_first = false;
			return px + " " + py;
		}).join(' ');

		// generate DOM elements
		var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		var polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		polygon.setAttribute('points', polygonPointsAttrValue);
		polygon.style.opacity = parseInt(this.state.numOpacity2)/100;
		
		g.appendChild(polygon);
		svg_mapping.append(g);

		// calculate polygon square footage https://www.wikihow.com/Calculate-the-Area-of-a-Polygon
		var sf = Math.round(Math.abs(max_y - max_x)) / 2;

		// generate seats with accordance to square footage size
		var tws = 0, tns = 0, bg = "";
		if (hall.areas[z].seats){

			// zone custom background
			bg = (hall.areas[z].seats.bg === undefined)?"":hall.areas[z].seats.bg;

			// total seats per zone
			tws = hall.areas[z].seats.tws;

			// total passes per zone
			tns = hall.areas[z].seats.tns;

			// load custom bg if any
			if(bg.length > 0){
				svg_mapping.style.backgroundImage = 'url('+bg+');' //  css('background-image', 'url('+bg+')');
				svg_mapping.style.backgroundPosition = 'center';   // css('background-position', 'center');
			
				// svg_mapping.css('background-size', (max_px - min_px) + 'px auto');
				svg_mapping.style.backgroundSize = '100% auto'; // css('background-size', '100% auto');
				svg_mapping.backgroundRepeat = 'no-repeat'; // css('background-repeat', 'no-repeat');
			}else{
				svg_mapping.backgroundImage = 'none'; // css('background-image', 'none');
			}

			// seat size
			let height = Math.sqrt(sf / tws);
			if(typeof(hall.areas[z].seats.height) === 'undefined') hall.areas[z].seats.height = 100; 
			let height_slider = hall.areas[z].seats.height;
			height *= (parseInt(height_slider) / 100);

			let li = "";
			let s = 0;
			while(s < tws){

				// seat default coordinates
				let x = 0;
				let y = 0;

				// prevent undefined js error
				if(!hall.areas[z].seats.points) hall.areas[z].seats.points = [];

				// get mapped seat coordinates and align them accordingly
				if(hall.areas[z].seats.points[s]){

					x = (hall.areas[z].seats.points[s].x) * max_times + (svg_width/2);
					y = (hall.areas[z].seats.points[s].y) * max_times + (svg_height/2);
				}

				// get seat HTML
				let seat = this.structSeat(hall, z, s, height, x, y);

				// add seat to hall layout canvas
				seat.g.obj = this;
				svg_mapping.append(seat.g);
				s++;
			}

			// zone passes
			if (tws == 0 && tns > 0){

                svg_number_cont.style.display = 'block';
                svg_mapping_cont.style.display = 'none';
                // document.querySelector('.picker_select').setAttribute('id', "c0z"+z);

				// svg_number_cont.fadeIn(0);
				// svg_mapping_cont.fadeOut(0);

				// $(".picker_select").attr("id","c0z"+z);

			// zone seats
			}else{

                svg_number_cont.style.display = 'none';
                svg_mapping_cont.style.display = 'block';

				// svg_number_cont.fadeOut(0);
				// svg_mapping_cont.fadeIn(0);
			}
		}

		// remove seat variation picker if present
        document.querySelector('body').classList.remove('pvarshow');
		// $("body").removeClass('pvarshow');

		// close zone selection | keep selected seats
        onClick('#seat_mapping_close', e => {

            document.querySelector('.seat_mapping_temp').remove();
            this.state.current_zone_id = -1;
        });

		// $("#seat_mapping_close").on("click", function(){
		// 	$("#seat_mapping").fadeOut();
		// 	$(".seat_mapping_temp").remove();
		// 	current_zone_id = -1;
		// });

		// close zone selection | cancel selected seats
        onClick('#seat_mapping_cancel', e => {

            // find if user selected anything in current zone 
            let selected_tickets = this.state.tickets.filter(t => t.zone_id == this.state.current_zone_id);
            if(selected_tickets.length == 0){

                // destroy views
				document.querySelector('.seat_mapping_temp').remove();
				this.state.current_zone_id = -1;
				return;
			}

			let l = confirm( __html('Cancel selections?') );
			if(l){

                // destroy views
				document.querySelector('.seat_mapping_temp').remove();
                
                // remove all selected seats from current zone
				this.state.tickets_release = [...this.state.tickets_release, ...this.state.tickets.filter(t => (t.zone_id == this.state.current_zone_id))];
                this.state.tickets = this.state.tickets.filter(t => t.zone_id != this.state.current_zone_id);
                this.refreshSelectedTicket();
                this.state.current_zone_id = -1;
				return;
			}
        });

		// $("#seat_mapping_cancel").on("click", function(){

		// 	if(tickets.length==0){

		// 		$("#seat_mapping").fadeOut();
		// 		$(".seat_mapping_temp").remove();
		// 		current_zone_id = -1;
		// 		return;
		// 	}

		// 	var l = confirm($(khl).data('cancelsel'));
		// 	if(l){

		// 		$("#seat_mapping").fadeOut();
		// 		$(".seat_mapping_temp").remove();
		// 		current_zone_id = -1;
		// 		tickets = []; refreshSelectedTicket(tickets, hall, -1, -1);
		// 		return;
		// 	}
		// });

		// init seat click listeners
		this.showSeatsListeners();

		// preload default selections
		this.refreshSelectedTicket();

		// get from backend
		this.checkReservations();

		// mark reserved seats | if any stored in cache
		// this.markBookings();

		// scroll button listeners
        onClick('.kp-prev', e => { document.querySelector('#svg_mapping_cont').scrollLeft += 180; })
        onClick('.kp-prev', e => { document.querySelector('#svg_mapping_cont').scrollLeft -= 180; })

		// $(".kp-prev").on("click",function(){ $('#svg_mapping_cont').animate( { scrollLeft: '+=180' }, 500); });
		// $(".kp-next").on("click",function(){ $('#svg_mapping_cont').animate( { scrollLeft: '-=180' }, 500); });
	}

    showSeatsListeners = () => {

        let self = this;
        let hall = this.state.hall_js;
        let myticketUserId = this.state.myticketUserId;
        // make sure reservations are loaded
		// setTimeout(function(){

			// double click listener for admins only
			// $(".cr, .tx").off("dblclick");
			// let justdblclick = false;
			// if($(khl).data('admin')) $(".cr, .tx").on("dblclick", function(){

			// 	if(justdblclick) return;
			// 	justdblclick = true;

			// 	var ticket_id = $(this).attr("id").substr(1);

			// 	var z = parseInt($(this).data("zone"));
			// 	var s = $(this).data("index");

			// 	// cancel reservation
			// 	if($("#c"+ticket_id).hasClass("booked")){

			// 		var l = confirm("Admin mode. Cancel this reservation?");
			// 		if(l){ setBooking(z+"_"+ticket_id, "clear"); } // $("#c"+ticket_id).removeClass("booked");

			// 	// mark as reserved
			// 	}else{

			// 		var l = confirm("Admin mode. Mark as reserved?");
			// 		if(l){ setBooking(z+"_"+ticket_id, "book"); } //$("#c"+ticket_id).addClass("booked");
			// 	}
			// 	setTimeout(function(){ justdblclick = false; }, 1000);
			// });

			// single click listener
            let crtx = (e) => {

                // if(this.state.pending_reservations) return;
            
				// hide price variation cont
                document.querySelector('body').classList.remove('pvarshow');
				// $("body").removeClass('pvarshow');

				let ticket_id = e.currentTarget.getAttribute('id').substr(1);
                // $(this).attr("id").substr(1);

                let z = parseInt(e.currentTarget.dataset.zone);
                let s = e.currentTarget.dataset.index;

				console.log('click'+ticket_id);

				// let z = parseInt($(this).data("zone"));
				// var s = $(this).data("index");

				// double click listener for admins to cancel reservations
                if(document.querySelector('#c'+ticket_id).classList.contains('booked'))
                    return;
				// if($("#c"+ticket_id).hasClass("booked"))
				// 	return;

				// unreserve ticket
				if(document.querySelector('#c'+ticket_id).classList.contains('reserved')){

					self.reserveSeat(ticket_id, z, s, '', '');
					return;
				}
				
				// check for variations
				if(!hall.pcfs) hall.pcfs = [];
				let pcfshtml = '';
				for(let pv of hall.pcfs){

					if(hall.areas[z].seats['pcf'+pv.index]) pcfshtml += '\
					<li>\
						<input value="'+hall.areas[z].seats['pcf'+pv.index]+'" data-label="'+pv.label+'" type="radio" id="pvar-'+pv.index+'" name="selector">\
						<label for="pvar-'+pv.index+'">' + pv.label + ' (' + priceFormat(this.state.response.event, hall.areas[z].seats['pcf'+pv.index]) + ') </label>\
						<div class="check"></div>\
					</li>';
					
					// console.log(hall.areas[z].seats['pcf'+pv.index]);
				}

				// load price variation picker
				if(pcfshtml){

					// seats mode without zone popup
					if(this.data.rendertype.value == 0){
								
                        document.querySelector('#variation_cont ul.pvar').innerHTML = pcfshtml;
						// $("#variation_cont ul.pvar").html(pcfshtml);

						// assign variation listeners
                        onChange('#variation_cont ul.pvar input[type=radio]', e => {
                          
                            self.reserveSeat(ticket_id, z, s, e.currentTarget.value, e.currentTarget.dataset.label);
                        });
						// $("#variation_cont ul.pvar input[type=radio]").change(function() {

						// 	reserveSeat(hall, ticket_id, z, s, this.value, this.dataset.label);
						// });

						// cancel variable reservation if currently reserved
                        if(document.querySelector('#c'+ticket_id).classList.contains("reserved")){ self.reserveSeat(ticket_id, z, s, '', ''); }else{ document.querySelector('body').classList.add('pvarshow'); }
						// if($("#c"+ticket_id).hasClass("reserved")){ reserveSeat(hall, ticket_id, z, s, '', ''); }else{ $("body").addClass('pvarshow'); }
					
					// seats mode with zone popup
					}else{
						
                        document.querySelector('#variation_cont_zone ul.pvar').innerHTML = pcfshtml
						// $("#variation_cont_zone ul.pvar").html(pcfshtml);

						// assign variation listeners
                        onChange('#variation_cont_zone ul.pvar input[type=radio]', e => {
                          
                            self.reserveSeat(ticket_id, z, s, e.currentTarget.value, e.currentTarget.dataset.label);

                            document.querySelector('#variation_cont_zone').style.display = 'none';
                        });

						// $("#variation_cont_zone ul.pvar input[type=radio]").change(function() {

						// 	reserveSeat(hall, ticket_id, z, s, this.value, this.dataset.label);

						// 	$("#variation_cont_zone").fadeOut();
						// });

                        document.querySelector('#variation_cont_zone').style.display = 'block';

						// $("#variation_cont_zone").fadeIn();

						// user asks to close
                        onClick('.var_toolbar_close .times', e => {

                            document.querySelector('#variation_cont_zone').style.display = 'none';
                        });
						// $(".var_toolbar_close .times").click(function() { $("#variation_cont_zone").fadeOut(); });
					}

				}else{

					this.reserveSeat(ticket_id, z, s, '', '');
				}

				// mark reserved seats
				this.markBookings();
            }
            
            onClick('.cr', e => crtx(e));
            onClick('.tx', e => crtx(e));
			// $(".cr, .tx").off("click");
			// $(".cr, .tx").on("click", function(){
	
			// });

			this.passPicker();

			

			// $("#kp_image").animate({opacity: '100%'}, 300);

            document.querySelector('#kp_image').style.opacity = 1;

			// firstLoad = 50;

		// },firstLoad);
    }

    refreshSelectedTicket = () => {

		// setCookie("tickets_"+this.state.event, JSON.stringify(this.state.tickets), 1);
        // cache pending reservations, to keep data after page refreshes

		// selected package index
		// let pi = sessionStorage.getItem('date_select') ? parseInt(sessionStorage.getItem('date_select')) : 0;
        sessionStorage.setItem("tickets_"+this.state.response.event._id+"_"+sessionStorage.getItem('date_select'), JSON.stringify(this.state.tickets));

        // console.log(this.state.tickets);

        if(document.querySelector('.selected_seats')) document.querySelector('.selected_seats').innerHTML = "";

        // get default summary table
        if(!this.state.summary_table) this.state.summary_table = document.querySelector('.kp-ticket-row').innerHTML;

        let hall = this.state.hall_js;
        let zone_id = this.state.current_zone_id;
		let kp_ticket_rows = '';
		let pass_count = 0;
		let output = this.state.tickets.map((item) => {

			// let ticket_row = (item.ticket_row) ? item.ticket_row : hall.areas[item.zone_id].seats.title;
			// let ticket_price = (item.ticket_price) ? item.ticket_price : this.state.price;
			let ticket_id = item.seat_id + 'z' + item.zone_id;
			// let ticket_text = item.ticket_text;
            let fields, summary_table_row;
			// console.log(item);

			// available summary table key value fields 
			let summary_table_fields = {}
			if(hall.areas[item.zone_id] && hall.areas[item.zone_id].seats) Object.keys(hall.areas[item.zone_id].seats).map((key, index) => { if(!this.state.exclude.includes(key)){ summary_table_fields['{{ticket_'+key+'}}'] = hall.areas[item.zone_id].seats[key]; } });

			// console.log('restore');
		
			// console.log(summary_table_fields);
			switch(item.type){

				case 'seat':

					if(!hall.areas[item.zone_id]) return;

					if(!hall.areas[item.zone_id].seats) return;
		
					// if(hall.areas[item.zone_id].seats.points[ticket_id]){
		
					// 	// override seat text
					// 	if(hall.areas[item.zone_id].seats.points[ticket_id].t)
					// 		ticket_text = hall.areas[item.zone_id].seats.points[ticket_id].t;
		
					// 	// override seat row
					// 	if(hall.areas[item.zone_id].seats.points[ticket_id].r)
					// 		ticket_row = hall.areas[item.zone_id].seats.points[ticket_id].r;
		
					// 	// override seat price
					// 	// if(hall.areas[item.zone_id].seats.points[ticket_id].p)
					// 	// 	ticket_price = parseFloat(hall.areas[item.zone_id].seats.points[ticket_id].p);
					// }



					// structure summary table
					summary_table_row = 
					`<tr>
						<td>
							<div class="details">
								${ true ? '<div>' + __html('Seat %1$', item.seat_text) + '</div>': '' }
								${ true ? '<div>' + __html('Row %1$', item.seat_row) + '</div>': '' }
								${ item.cfs.map(c => {

									return '<div>' + __html(c.label+' %1$', item[c.id]) + '</div>'

								 }).join('')
								}
								${ item.cfs.length == 0 ? '<div>' + __html('Zone %1$', item.zone_text) + '</div>': '' }
					
							</div>
						</td>
						<td></td>                                                                                  
						<td>${ priceFormat(this.state.response.event, item.price) } <span>${ __html('per ticket') }</span></td>
						<td data-id="${ item.id + 'z' + item.zone_id }"  data-path="${ item.path }" class="kp-rem-seat"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg></td>
					</tr>`;

					// summary table field mapping
					fields = Object.assign(summary_table_fields, {'{{seat_text}}': item.seat, '{{zone_title}}': hall.areas[item.zone_id].seats.title, '{{seat_row}}': item.row, '{{ticket_price}}': priceFormat(this.state.response.event, item.price), '{{ticket_id}}': ticket_id, '{{ticket_zone_id}}': item.zone_id});

					for(let f in fields){ summary_table_row = summary_table_row.replaceAll(f, fields[f]); }

					kp_ticket_rows += summary_table_row;

                    if(document.querySelector('#c'+ticket_id)) document.querySelector('#c'+ticket_id).classList.add('reserved');
					// $("#c"+ticket_id).addClass("reserved");
		
					// return only previewd zone seats
					if(item.price) if(zone_id == item.zone_id) return item.seat_text + " " + priceFormat(this.state.response.event, item.price)+" &nbsp;&nbsp;";
					if(zone_id == item.zone_id) return item.seat_text;
					
				break;
				case 'zone':

					if(!hall.areas[item.zone_id]) return;

					if(!hall.areas[item.zone_id].seats) hall.areas[item.zone_id].seats = { title: __html('Zone %1$', item.zone_id), tws: 0, tns: 1, price: this.state.price };

					// if(!hall.areas[item.zone_id].seats)  ;

					// let tns = hall.areas[item.zone_id].seats.tns;

					// structure summary table
					summary_table_row = 
					`<tr>
						<td>
							<div class="details">
								${ item.cfs.map(c => {

									return '<div>' + __html(c.label+' %1$', item[c.id]) + '</div>'

									}).join('')
								}
								${ item.cfs.length == 0 ? '<div>' + __html('Zone %1$',item.zone_id) + '</div>': '' }
							</div>
						</td>
						<td></td>                                                                                  
						<td>${ priceFormat(this.state.response.event, item.price) } <span>${ __html('per ticket') }</span></td>
						<td data-zone="${ item.zone_id }" data-id="${ item.id + 'z' + item.zone_id }" data-path="${ item.path }"  class="kp-rem-seat"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg></td>
					</tr>`;

					// summary table field mapping
					fields = Object.assign(summary_table_fields, {'{{ticket_zone_title}}':hall.areas[item.zone_id].seats.title, '{{ticket_row}}':'-', '{{ticket_price}}':priceFormat(this.state.response.event, item.price), '{{ticket_id}}':ticket_id, '{{ticket_zone_id}}':item.zone_id});
					
					// summary_table_row = this.state.summary_table;

					for(let f in fields){ summary_table_row = summary_table_row.replaceAll(f, fields[f]); }

					kp_ticket_rows += summary_table_row;

					// console.log('check');
					
					document.querySelector("#pl"+item.zone_id).classList.add('selected');
					// if(document.querySelector('#c'+ticket_id)) document.querySelector('#c'+ticket_id).classList.add('reserved');

					// return only previewed zone seats
					if(item.price.length > 0) if(zone_id == item.zone_id) return item.zone_text + " " + priceFormat(this.state.response.event, item.price)+" &nbsp;&nbsp;";
					if(zone_id == item.zone_id) return item.zone_text;

				break;
				case 'pass':

					if(!hall.areas[item.zone_id]) return;

					// structure summary table
					summary_table_row = 
					`<tr>
						<td>
							<div class="details">
								${ '<div>' + __html('Pass #%1$', item.pass_text + ' ' + item.zone_text ) + '</div>' }
								${ item.cfs.map(c => {

									return '<div>' + __html(c.label+' %1$', item[c.id]) + '</div>'

									}).join('')
								}
								${ item.cfs.length == 0 ? '<div>' + __html('Zone %1$',item.zone_id) + '</div>': '' }
							</div>
						</td>
						<td></td>                                                                                  
						<td>${ priceFormat(this.state.response.event, item.price) } <span>${ __html('per ticket') }</span></td>
						<td data-zone="${ item.zone_id }" data-id="${ item.id + 'z' + item.zone_id }" data-path="${ item.path }"  class="kp-rem-seat"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg></td>
					</tr>`;

					// summary table field mapping
					fields = Object.assign(summary_table_fields, {'{{ticket_zone_title}}':hall.areas[item.zone_id].seats.title, '{{ticket_row}}':'-', '{{ticket_price}}':priceFormat(this.state.response.event, item.price), '{{ticket_id}}':ticket_id, '{{ticket_zone_id}}':item.zone_id});
					
					// summary_table_row = this.state.summary_table;

					for(let f in fields){ summary_table_row = summary_table_row.replaceAll(f, fields[f]); }

					kp_ticket_rows += summary_table_row;
					
					// mark as reserved
					// let pass_id = ticket_id.split("z")[0];

					// if(isNaN(pass_id)) break;

					// make sure record exists
					if(hall.areas[item.zone_id].passes === undefined){
						hall.areas[item.zone_id].passes = [];
						hall.areas[item.zone_id].passes.push({id: "p1z"+item.zone_id, uid: "", class: ""});
					}

					console.log("pass_id "+item.pass_id);

					// mark pass as reserved
					hall.areas[item.zone_id].passes[item.pass_id].uid =this.state.myticketUserId;
					hall.areas[item.zone_id].passes[item.pass_id].class = "reserved";
					
					// count total pass selected
					pass_count++;

					if(item.price.length > 0) if(zone_id == item.zone_id) return '#' + item.pass_text + ' ' + item.zone_text + ' ' + priceFormat(this.state.response.event, item.price)+" &nbsp;&nbsp;";
					if(zone_id == item.zone_id) return '#' + item.pass_text + ' ' + item.zone_text;

					// if(zone_id == item.zone_id) return ticket_text;
				break;
			}
		}).join(' ');

		if(kp_ticket_rows==''){

            document.querySelector('.kp-btn-reserve').style.display = 'none';
            document.querySelector('.kp-table').style.display = 'none';
			// $(".kp-btn-reserve,.kp-table").fadeOut(0);
		}else{

            document.querySelector('.kp-btn-reserve').style.display = 'block';
            document.querySelector('.kp-table').style.display = 'block';
			// $(".kp-btn-reserve,.kp-table").fadeIn();
		}

		// update picker count
        // if(document.querySelector('.picker_select')) document.querySelector('.picker_select').value = pass_count;
		// $( ".picker_select" ).val(pass_count);

		// trim last space and coma 
		// if(output.length>1){  output = output.substring(0, output.length-2); }
		if(typeof(hall.areas[zone_id]) !== 'undefined' && document.querySelector('.seat_head .row1')) document.querySelector('.seat_head .row1').innerHTML = "<b>" + hall.areas[zone_id].seats.title + "</b>";
        
        // $(".seat_head .row1").html("<b>" + hall.areas[index].seats.title + "</b>");
		if(document.querySelector('.selected_seats')) document.querySelector('.selected_seats').innerHTML = output;
 
		if(document.querySelector('.sel_texts')) if(output==""){ document.querySelector('.sel_texts').style.display = 'none'; }else{ document.querySelector('.sel_texts').style.display = 'block'; }
		document.querySelector('.kp-ticket-row').innerHTML = kp_ticket_rows;
        document.querySelector('.kp-ticket-row').style.display = 'block';

		// refresh listeners
        onClick('.kp-rem-seat', e => {

            let path = e.currentTarget.dataset.path;
			let id = e.currentTarget.dataset.id;

            let l = confirm( __html('Remove?') );
			if(l){

                if(document.querySelector('#c'+id)) document.querySelector('#c'+id).classList.remove('reserved');
				this.state.tickets_release = [...this.state.tickets_release, ...this.state.tickets.filter(t => (t.path == path))];
                this.state.tickets = this.state.tickets.filter(t => !(t.path == path));
                this.refreshSelectedTicket();
            }
        });
	}

    markBookings = () => {

		// mark booked seats for current zone
        [...document.querySelectorAll(".cr")].forEach(el => el.classList.remove("booked"));
		// $(".cr").removeClass("booked");

		let hall = this.state.hall_js;
		let zone_id = this.state.current_zone_id;

		// console.log('markBookings ' + this.data.rendertype.value);

		// reservation object is empty, nothing to do
		if(!this.state.reservations) return;

		// switch layout rendering scenarious
		switch(this.data.rendertype.value){

			// seat mode - mark booked seats
			case 'seat':

				hall.areas.map((item, z) => {

					// map seats
					let tws = 0;
					if(hall.areas[z].seats){
			
						// total seats per zone
						tws = hall.areas[z].seats.tws;
			
						let s = 0;
						while(s < tws){

							if(this.state.reservations["s"+i]) if(this.state.reservations["s"+i]['s'] == 5 || (this.state.reservations["s"+i]["uid"] != this.state.myticketUserId && this.state.reservations["s"+i]['s'] == 3)){
									
								// mark as booked visually
								let ticket_id = s+'z'+z;
								document.querySelector('#c'+ticket_id).classList.add('booked');
								document.querySelector('#t'+ticket_id).classList.add('booked');
							}
							s++;
						}
					}
				});

			break;

			// zone mode - mark booked seats
			case 'zone':

				console.log(this.state.reservations);

				let tws = 0, tns = 0;
				if(hall.areas[zone_id])
				if(hall.areas[zone_id].seats){
					
					tws = hall.areas[zone_id].seats.tws;
					tns = hall.areas[zone_id].seats.tns;
					let i = 0, bi = 0;

					// seats
					while(i < tws){
		
						// block when ticket is booked or served by other users
						if(this.state.reservations["z"+zone_id+"s"+i]) if(this.state.reservations["z"+zone_id+"s"+i]['s'] == 5 || (this.state.reservations["z"+zone_id+"s"+i]["u"] != this.state.myticketUserId && this.state.reservations["z"+zone_id+"s"+i]['s'] == 3)){
		
							// mark as booked visually. Ex id: 0_0z0 (if type is a seat)
							document.querySelector("#c"+i+"z"+zone_id).classList.add('booked');
							document.querySelector("#t"+i+"z"+zone_id).classList.add('booked');
						}
						
						i++;
					}

					// passes
					i = 0;
					while (i < tns){

						// calc booked passes
						let ticket_id = i+'z'+zone_id;
						if(this.state.reservations[zone_id+"_"+ticket_id]){

							if(this.state.reservations[zone_id+"_"+ticket_id]["ticket_type"]=="pass"){
							// if(reservations[zone_id+"_"+ticket_id]["user"]!=myticketUserId && reservations[zone_id+"_"+ticket_id]["type"]>0){
		
								bi++;

								// mark passes as reserved (if type is a pass)
								if(typeof(hall.areas[zone_id].passes[i]) !== 'undefined'){
									
									// console.log("marked as booked"+bi);
									hall.areas[zone_id].passes[i].class = "booked";
								}
							}
						}
						i++;
					}

					// this.passPicker();

					// refresh number picker
					// console.log("has class:" + $(".picker_select").hasClass('rendered'));
					
					// update select picker once
					// if(this.state.bi_prev != bi || !this.state.bi_prev) if(tws == 0 && tns > 1){
						
					// 	let p = 0, picker = "";

					// 	// if(this.state.tickets.length >= this.state.ticketspbooking){
					// 	// 	alert( __html('Adding more tickets is not allowed') )
					// 	// 	return;
					// 	// }

					// 	// var pass_count = $( ".picker_select" ).val();
					// 	while(p <= (i - bi) && p <= this.state.ticketspbooking){

					// 		picker += '<option value="'+p+'" data-ofst='+bi+'>'+p+'</option>';
					// 		p++;
					// 	}

                    //     document.querySelector('.picker_select').innerHTML = picker;

					// 	// $(".picker_select").html(picker);

					// 	// currently reserved tickets per zone
					// 	// this.state.tickets

					// 	// let pass_count = jQuery.grep(this.state.tickets, (value) => {
					// 	// 	return parseInt(value.zone_id) == zone_id && value.ticket_type == "pass";
					// 	// });

					// 	// console.log(tns + " - " + bi  + " - " + pass_count.length)
					// 	// console.log("pass_count "+pass_count)

					// 	// render
                    //     document.querySelector('.picker_select').value = pass_count.length;
                    //     document.querySelector('.picker_select').classList.add('rendered');

					// 	// $(".picker_select").val(pass_count.length);
					// 	// $(".picker_select").addClass('rendered');
					// }

					// // update remaining ticket amount in live on second loop
					// if(tws == 0 && tns > 0){

					// 	// currently reserved tickets per zone
                    //     let pass_count = this.state.tickets.filter(t => parseInt(t.zone_id) == zone_id && t.ticket_type == "pass")

					// 	// var pass_count = jQuery.grep(tickets, function(value) {
					// 	// 	return parseInt(value.zone_id) == zone_id && value.ticket_type == "pass";
					// 	// });

					// 	// render
                    //     document.querySelector(".seat_head .row1").innerHTML = "<b>"+hall.areas[zone_id].seats.title + "</b>" + " &nbsp;" + (tns-bi-pass_count.length)+" "+ __html('tickets left')

					// 	// $(".seat_head .row1").html("<b>"+hall_js.areas[zone_id].seats.title + "</b>" + " &nbsp;" + (tns-bi-pass_count.length)+" "+$(khl).data("tickets_left"));
					// }

					this.state.bi_prev = bi;
				}
		
				// zone - mark booked/reserved zones
				for (let i = 0; i < hall.areas.length; i++) {
		
					tws = 0, tns = 0;
					if (hall.areas[i].seats){

						tws = hall.areas[i].seats.tws ? parseInt(hall.areas[i].seats.tws) : 0;
						tns = hall.areas[i].seats.tns ? parseInt(hall.areas[i].seats.tns) : 0;

						// console.log(tws + " - " + tns);

				
						// get booked tickets

						// var booked = jQuery.grep(Object.keys(reservations), function(value) {
						// 	// console.log(value);
						// 	return value.split("_")[0] == i && reservations[value]["type"]>0;
						// });

						// get reserved tickets
                        let reserved = this.state.tickets.filter(t => t.zone_id == i);
						// var reserved = jQuery.grep(tickets, function(value) {
						// 	return value.zone_id == i
						// });

						// set defaults
                        document.querySelector("#pl"+i).classList.remove("booked");
                        document.querySelector("#pl"+i).classList.remove("selected");
						// $("#pl"+i).removeClass("booked").removeClass("selected");

						// zone with seats and passes fully reserved
                        if(reserved.length == tws+tns) document.querySelector("#pl"+i).classList.add("selected");
						// if(reserved.length == tws+tns) $("#pl"+i).addClass("selected");
						// if(reserved.length == tws+tns) $("#pl"+i).addClass("selected");
						
						// zone without seats and passes fully booked
						if(tns == 1 && tws == 0 && this.state.reservations["z"+i]){

							// console.log("restore z"+i);
							// console.log(this.state.reservations["z"+i]);

							if(this.state.reservations["z"+i]['rc'] == 1 &&  this.state.reservations["z"+i]['u'] != this.state.myticketUserId ) document.querySelector("#pl"+i).classList.add('booked');
						}
												
						// zone fully booked
						// if(booked.length == tws+tns) $("#pl"+i).addClass("booked");
						if(typeof(this.state.reservations_zones[i]) !== 'undefined')
						if(parseInt(this.state.reservations_zones[i].count) == tws+tns) document.querySelector("#pl"+i).classList.add("booked"); // $("#pl"+i).addClass("booked");
					}
				}
			break;
		}
	}

	passPicker = () => {

		console.log('passPicker');

		let self = this;
		let hall = this.state.hall_js;
		let z = this.state.current_zone_id;

		// passes - create picker if empty
		if(document.querySelector(".picker_select").innerHTML.length < 10){

			let p = 0, picker = "";
			let passes = this.state.tickets.filter(t => (t.zone_id == z));
			
			// while(p <= (i - bi) && p <= this.state.ticketspbooking){
			while(p <= this.state.ticketspbooking){

				picker += '<option value="'+p+'" '+( passes.length == p ? 'selected' : '' )+' >'+p+'</option>';
				p++;
			}

			document.querySelector(".picker_select").innerHTML = picker; // $(".picker_select").html(picker);

			// number pick listener
			onChange('.picker_select', e => {

				console.log(z)
				console.log(hall.areas[z])

				// let ticket_id = e.currentTarget.getAttribute('id').substr(1);
				// let ticket_id = $(this).attr("id").substr(1);
				// let ofst = parseInt(document.querySelector('.picker_select option:selected').dataset.ofst);
				// let ofst = parseInt(e.currentTarget.value);
				// var ofst = parseInt($(".picker_select option:selected").attr("data-ofst"));
				// let z = ticket_id.split("z")[1];

				// let s = 0;
				// let tns = parseInt(hall.areas[z].seats.tns);
				

				// reset previous selection for this zone
				// console.log("ofst"+ofst);
				// console.log(hall_js.areas[z].passes);
				hall.areas[z].passes.map((pass, index) => {

					if(pass.uid == this.state.myticketUserId && pass.class == "reserved"){

						hall.areas[z].passes[index].uid = "";
						hall.areas[z].passes[index].class = "";
						this.state.tickets_release = [...this.state.tickets_release, ...this.state.tickets.filter(t => (t.zone_id == z))];
						self.state.tickets = self.state.tickets.filter(t => t.zone_id != z)
						

						// tickets = jQuery.grep(tickets, function(value) {

						// 	// clear everything under this zone
						// 	return (value.zone_id != z); //  && value.ticket_pass != "pass"

						// 	// console.log("removing" + value.ticket_id + " - " + hall_js.areas[z].passes[index].id);
						// 	// return !(value.ticket_id == parseInt(index + ofst)+"z"+z);
						// 	// return !(value.ticket_id == hall_js.areas[z].passes[index].id.substr(1));
						// });
					}
				});

				// mark first selected number of seats as reserved
				let ti = parseInt(e.currentTarget.value);
				let i = 0;
				hall.areas[z].passes.map((pass, index) => {

					if(pass.uid == "" && pass.class == "" && i < ti){

						hall.areas[z].passes[index].uid = this.state.myticketUserId;
						hall.areas[z].passes[index].class = "reserved";

						// let ticket_text = parseInt(i)+1;
						// let ticket_row = '', ticket_price = '';
						// let zone_text = hall.areas[z].seats.title;

						// if(hall.areas[z].seats.price)
						// 	ticket_price = hall.areas[z].seats.price;

						// if(ticket_row=='') ticket_row = zone_text;

						// structure ticket object 
						// var ticket_obj = { zone_id: z, zone_text: zone_text, ticket_id: pass.id.substr(1), ticket_text: ticket_text, ticket_row: ticket_row, ticket_price: ticket_price, cfs: hall.cfs, type: "pass" };
						// let obj = { zone_id: parseInt(z), zone_text: zone_text, path: 'z' + parseInt(index + ofst)+"z"+s, ticket_text: ticket_text, ticket_row: ticket_row, ticket_price: ticket_price, cfs: hall.cfs, ticket_type: "pass", type: "pass" };

						// structure ticket object 
						let obj = { id: 'p'+index, pass_id: parseInt(index), pass_text: parseInt(i)+1, zone_id: parseInt(z), zone_text: hall.areas[z].seats.title, path: 'z'+z+'p'+index, title: hall.areas[z].seats.title, price: hall.areas[z].seats.price ? hall.areas[z].seats.price : this.state.price, cfs: hall.cfs, type: "pass", render: this.data.rendertype.value };

						// pass additional data to the ticket object such as price, custom fields, seat information 
						Object.keys(hall.areas[z].seats).map(function(key, index) {
							
							// exclude seats key as it contains large data sets of unrelated data
							if(!self.state.exclude.includes(key)){ obj[key] = hall.areas[z].seats[key]; }
						});

						// obj['price'] = ticket_price;

						this.state.tickets.push(obj);

						i++;
					}
				});

				console.log(this.state.tickets);

				// refresh top bar tickets
				this.refreshSelectedTicket();

				// mark reserved seats
				this.markBookings();
			});
		}
	}

    structSeat = (hall, z, i, height, x, y) => {

        let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', "dc"+i);
        g.setAttribute('data-index', i);

        let circle = document.createElementNS('http://www.w3.org/2000/svg', this.data.seatshape.value);
        circle.setAttribute('id', "c"+i+'z'+z);
        circle.setAttribute('class', "cr");
        circle.setAttribute('data-index', i);
        circle.setAttribute('data-zone', z);
        circle.setAttribute('style', 'opacity:'+(this.state.numOpacity/100)+';');

        switch(this.data.seatshape.value){

            case 'circle':
                circle.setAttribute('r', height/2);
                // set coordinates
                circle.setAttribute('cx', x);
                circle.setAttribute('cy', y);
            break;
            case 'rect':
                circle.setAttribute('width', height);
                circle.setAttribute('height', height);
                // set coordinates
                circle.setAttribute('x', x-height/2);
                circle.setAttribute('y', y-height/2);
            break;
        }

        let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('id', "t"+i+'z'+z);
        text.setAttribute('dy', ".3em");
        text.setAttribute('stroke-width', "0px");
        text.setAttribute('text-anchor', "middle");
        text.setAttribute('stroke', "#000");
        if(this.state.hideNumbers==1){ text.setAttribute('class', "tx dn"); }else{ text.setAttribute('class', "tx"); }
        text.setAttribute('data-index', i);
        text.setAttribute('data-zone', z);
        text.setAttribute('style', "font-size:"+this.data.numbersize.value+"px");

        // set coordinates
        text.setAttribute('x', x);
        text.setAttribute('y', y);

        text.setAttribute('data-toggle', "popover");
        text.setAttribute('title', "Seat Settings");
        text.setAttribute('data-content', "test");

        text.innerHTML = i+1;

        // set custom assigned seat number
        if(hall.areas[z].seats.points[i] !== undefined) if(hall.areas[z].seats.points[i]) if(hall.areas[z].seats.points[i].t) text.innerHTML = hall.areas[z].seats.points[i].t;
        
        g.appendChild(circle);
        g.appendChild(text);

        return {g:g, circle:circle, text:text};
    }

	checkReservations = () => {

		let self = this;

		// console.log('checkReservations');

	    // perform ajax request
		fetch(this.getAPI(), {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Kenzap-Locale': getCookie('locale') ? getCookie('locale') : "en",
                'Kenzap-Sid': self.data.sid, 
            },
            body: JSON.stringify({
                query: {
                    bookings: {
                        type: "get-reservations",
						tickets: self.state.tickets,
						tickets_release: this.state.tickets_release,
						event_id: getParam('id'),
						package_id: sessionStorage.getItem('date_select'),
						user_id: sessionStorage.getItem('myticket_user_id'),
						zone_id: self.state.current_zone_id,
						render_type: self.data.rendertype.value
                    }
                }
            })
        })
        .then(response => response.json())
        .then(response => {

			this.state.pending_reservations = false;
			this.state.tickets_release = [];

            if(response.success){

				self.state.reservations = response.bookings.data;
				// self.state.reservations_zones = response.bookings.data_zones;
				self.markBookings();

				// init seat click listeners after first load
				if(self.data.rendertype.value == 1){

					console.log('seatListeners'); //  self.seatListeners(hall_js); 
				} 
				// && firstLoad==60
            }else{

                parseApiError(response);
            }

			this.state.pending_reservations = false;
        })
        .catch(error => {
            console.error('Error:', error);
        });

		return false;
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