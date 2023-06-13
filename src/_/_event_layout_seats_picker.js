// dependencies
import { H, __attr, __html, attr, html, onClick, setCookie, getCookie, parseApiError, spaceID, onChange } from '@kenzap/k-cloud';
import { priceFormat, getParam, CDN } from '../_/_helpers.js';
import { PassPicker } from "../_/_event_layout_pass_picker.js"

/**
 * @name SeatsPicker
 * @description This class is responsible for seat selection and rendering. 
 * @param {Object} parent - parent class state, variables and methods.
 * @param {Object} z - selected zone ID.
 * 
 * @returns {Instance}
 */
export class SeatsPicker{

    // init class
    constructor(parent, z){
    
		this.parent = parent;
		this.state = parent.state; // parent variables
		this.data = parent.data;   // layout settings data
		this.z = z; // current zone id

        if(z > -1) this.zoneSeatMap(z);
    }

	// seat map for seat rendering mode
	seatMap = () => {

		let hall = this.state.hall_js;
        let kp_svg = document.querySelector(".kp_svg");
        let i = 0;

		hall.areas.map((item, z) => {

			// map seats
			let tws = 0;
			if (hall.areas[z].seats){
	
				// total seats per zone
				tws = hall.areas[z].seats.tws;
	
				// seat size
				if(typeof(hall.areas[z].seats.height) === 'undefined') hall.areas[z].seats.height = 100; 
				let height = parseFloat(hall.areas[z].seats.height) / this.state.polygon_scale / 2;
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
					if (hall.areas[z].seats.points[s]){
	
						x = xc / this.state.polygon_scale + (hall.areas[z].seats.points[s].x) / this.state.polygon_scale;
						y = yc / this.state.polygon_scale + (hall.areas[z].seats.points[s].y) / this.state.polygon_scale;
					}
	
					// get seat HTML
					let seat = this.structSeat(hall, z, s, height, x, y);
	
					// add seat to hall layout canvas
					seat.g.obj = this;
					kp_svg.append(seat.g);

					s++;
				}
			}
			
			i++;
		});
	}

	// seat map zone rendering mode
    zoneSeatMap = (z) => {

		document.querySelector('#' + this.data.id).insertAdjacentHTML('afterbegin', 
        `
        <div id="seat_mapping" class="seat_mapping_temp" >
            <div id="top_toolbar">
                <div id="seat_mapping_close">${ __html('Confirm') }</div>
				<div id="seat_select_all" class="${ this.data.posmode.value == '0' ? 'dn' : '' }" data-select="${ __attr('Select all') }" data-revert="${ __attr('Revert selection') }">${ __html('Select All') }</div>
                <div id="seat_mapping_cancel"><span class="txt">back</span><span class="times"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg></span></div>
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
            <div id="svg_mapping_cont" style="${ '--img:url(' + this.state.hall_js.img + ')' };">
                <svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" id="svg_mapping" class="noselect" style="background-image:${ 'url(' + this.state.hall_js.img + ')' };"> </svg>
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
		
		this.state.seat_size = parseInt(this.data.seatsize.value);
		this.state.edge_offset = this.state.seat_size * 3;
		this.state.current_zone_id = z;
		this.state.pending_reservations = true;
		
		// scale polygon, seat space according to the seat size 
		let scale = parseInt(this.state.seat_size)/2;

		// get central point 
		let x = 0, y = 0, xc = 0, yc = 0, i = 0;
		let cp = hall.areas[z].coords.points.map((item) => {

			i++; x += item.x; y += item.y;
			return item;
		});

		// calc all x and y coords separately. Divide by the total amount of coords to find central point
		xc = x / i;
		yc = y / i;

		// get relative distance from coords to center point
		let il = 0, yl = 0, xl = 0; //, max_times = 1;
		hall.areas[z].coords.points_rel = [];
		cp = hall.areas[z].coords.points.map((item) => {

			let temp = Math.abs(xc - item.x);

			// find longest coordinates
			temp = Math.abs(xc - item.x);
			xl = temp > xl ? temp : xl;
			temp = Math.abs(yc - item.y);
			yl = temp > yl ? temp : yl;
			
			// store central points
			hall.areas[z].coords.points_rel.push({x : item.x - xc, y : item.y - yc});
		}); 

		// find polygon edges TODO, fit rendered contents by zone edges
		let polygon_edges = {x: 0, y: 0, bottom: 0, top: 90000000, left: 90000000, right: 0}; i=0;
		hall.areas[z].coords.points_rel.map((item) => {

			i++;

			let px = item.x * scale;
			let py = item.y * scale;

			if(polygon_edges.left > px) polygon_edges.left = px;
			if(polygon_edges.right < px) polygon_edges.right = px;
			if(polygon_edges.top > py) polygon_edges.top = py;
			if(polygon_edges.bottom < py) polygon_edges.bottom = py;
		});

		// find seat area edges, fit rendered contents by edge seat
		let seat_area_edges = {bottom: 0, top: 90000000, ofst_top: 0, ofst_left: 0, left: 90000000, right: 0};
		if(hall.areas[z].seats.points) hall.areas[z].seats.points.map((item) => {

			if(!item) return;

			let px = item.x * scale;
			let py = item.y * scale;

			if(seat_area_edges.left > px) seat_area_edges.left = px;
			if(seat_area_edges.right < px) seat_area_edges.right = px;
			if(seat_area_edges.top > py) seat_area_edges.top = py;
			if(seat_area_edges.bottom < py) seat_area_edges.bottom = py;

			// console.log(item.x + " " + item.y);
		});

		// normalize negative X and Y edge offsets
		if(seat_area_edges.left < 0){

			seat_area_edges.ofst_left = Math.abs(seat_area_edges.left);
			seat_area_edges.right += Math.abs(seat_area_edges.left);
			seat_area_edges.left = 0;
		}

		if(seat_area_edges.top < 0){

			seat_area_edges.ofst_top = Math.abs(seat_area_edges.top)
			seat_area_edges.bottom += Math.abs(seat_area_edges.top);
			seat_area_edges.top = 0;
		}

		// find seats edges
		// console.log(this.state.img_width + " " + this.state.img_height);
		// console.log(this.state.img_width + " " + parseInt(this.state.img_height * hall.img_width / this.state.img_width) + " " + document.querySelector("#myticket_img").width);
		// console.log(hall.img_width + " " + scale);
		// console.log((parseInt(hall.img_width) * scale) + 'px ' + (parseInt(hall.img_height) * this.state.img_width / hall.img_width * scale) + 'px');

		// seat scrolling window size
		svg_width = (seat_area_edges.right - seat_area_edges.left) + this.state.edge_offset;
		svg_height = (seat_area_edges.bottom - seat_area_edges.top) + this.state.edge_offset;

		// make full width
		if(svg_width < window.innerWidth) svg_width = window.innerWidth;

		svg_mapping.style.width = svg_width;
		svg_mapping.style.height = svg_height;

		// set scroll offset in the middle
		svg_mapping_cont.scrollTop = svg_height / 3;
		svg_mapping_cont.scrollLeft = svg_width / 6;

		// adjust zone bg image size
		svg_mapping.style.backgroundSize = (parseInt(hall.img_width) * scale) + 'px ' + (parseInt(this.state.img_height * hall.img_width / this.state.img_width) * scale) + 'px';
		svg_mapping.style.backgroundPosition = ((seat_area_edges.ofst_left + this.state.edge_offset / 2) - (xc * scale)) + 'px ' + ((seat_area_edges.ofst_top + this.state.edge_offset / 2) - (yc * scale)) + 'px';

		// generate scaled polygon points
		// let max_x = 0, max_y = 0;
		// let max_x_prev = 0, max_y_prev = 0, max_first = true;
		let polygonPointsAttrValue = hall.areas[z].coords.points_rel.map((item) => {

			// let height = (typeof(hall.areas[z].seats.height) === 'undefined') ? 100 : parseInt(hall.areas[z].seats.height); 

			// let px = item.x * scale + (svg_width/2);
			// let py = item.y * scale + (svg_height/2);
			let px = item.x * scale + seat_area_edges.ofst_left + this.state.edge_offset / 2;
			let py = item.y * scale + seat_area_edges.ofst_top + this.state.edge_offset / 2;

			// if(!max_first){
			// 	max_x += max_x_prev * item.y * scale;
			// 	max_y += max_y_prev * item.x * scale;
			// }

			// max_x_prev = item.x * scale;
			// max_y_prev = item.y * scale;

			// max_first = false;

			// console.log(px + " " + py);
			return px + " " + py;
		}).join(' ');

		// generate zone polygon
		let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		polygon.setAttribute('points', polygonPointsAttrValue);
		polygon.style.opacity = parseInt(this.state.numOpacity2) / 100;
		g.appendChild(polygon);
		svg_mapping.append(g);

		// generate full screen polygon to blend backgroud image
		g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
		polygon.setAttribute('points', "0 0 " + svg_width + " 0 " + svg_width + " " + svg_height + " 0 " + svg_height); //+ svg_width + " " + svg_height + " 0 " + svg_width + " " + svg_width + " " + svg_height
		polygon.style.opacity = parseInt(this.data.zonebgvisibility.value) / 100;     
		g.appendChild(polygon);
		svg_mapping.append(g);

		// calculate polygon square footage https://www.wikihow.com/Calculate-the-Area-of-a-Polygon
		// let sf = Math.round(Math.abs(max_y - max_x)) / 2;

		// generate seats with accordance to square footage size
		let tws = 0, tns = 0, bg = "";
		if (hall.areas[z].seats){

			// zone custom background
			bg = (hall.areas[z].seats.bg === undefined) ? "" : hall.areas[z].seats.bg;

			// total seats per zone
			tws = hall.areas[z].seats.tws;

			// total passes per zone
			tns = hall.areas[z].seats.tns;

			// load custom bg if any
			if(bg.length > 0){
				svg_mapping.style.backgroundImage = 'url('+bg+');'
				svg_mapping.style.backgroundPosition = 'center';  
			
				// svg_mapping.css('background-size', (max_px - min_px) + 'px auto');
				svg_mapping.style.backgroundSize = '100% auto';
				svg_mapping.backgroundRepeat = 'no-repeat'; 
			}else{
				svg_mapping.backgroundImage = 'none';
			}

			// seat size
			// let height = Math.sqrt(sf / tws);
			// if(typeof(hall.areas[z].seats.height) === 'undefined') hall.areas[z].seats.height = 100; 
			// let height_slider = hall.areas[z].seats.height;
			// height *= (parseInt(height_slider) / 100);
			// height = 50;

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

					// x = (hall.areas[z].seats.points[s].x) * scale + (svg_width/2);
					// y = (hall.areas[z].seats.points[s].y) * scale + (svg_height/2);
					x = (hall.areas[z].seats.points[s].x) * scale + seat_area_edges.ofst_left + this.state.edge_offset / 2;
					y = (hall.areas[z].seats.points[s].y) * scale + seat_area_edges.ofst_top + this.state.edge_offset / 2;
				}

				// get seat HTML
				let seat = this.structSeat(hall, z, s, this.state.seat_size, x, y);

				// add seat to hall layout canvas
				seat.g.obj = this;
				svg_mapping.append(seat.g);
				s++;
			}

			// zone passes
			if (tws == 0 && tns > 0){

                svg_number_cont.style.display = 'block';
                svg_mapping_cont.style.display = 'none';

			// zone seats
			}else{

                svg_number_cont.style.display = 'none';
                svg_mapping_cont.style.display = 'block';
			}
		}

		// remove seat variation picker if present
        document.querySelector('body').classList.remove('pvarshow');

		// close zone selection | keep selected seats
        onClick('#seat_mapping_close', e => {

			if(this.state.reloadPending) this.state.reload();
			
            document.querySelector('.seat_mapping_temp').remove();
            this.state.current_zone_id = -1;
        });

		// close zone selection | cancel selected seats
        onClick('#seat_mapping_cancel', e => {

            // find if user selected anything in current zone 
            let selected_tickets = this.state.tickets.filter(t => t.zone_id == this.state.current_zone_id);
            if(selected_tickets.length == 0){

                // destroy views
				document.querySelector('.seat_mapping_temp').remove();
				this.state.current_zone_id = -1;
				if(this.state.reloadPending) this.state.reload();
				return;
			}

			let l = confirm( __html('Cancel selections?') );
			if(l){

                // destroy views
				document.querySelector('.seat_mapping_temp').remove();
                
                // remove all selected seats from current zone
				this.parent.removeTicket('zone', this.state.current_zone_id);
				// this.state.tickets_release = [...this.state.tickets_release, ...this.state.tickets.filter(t => (t.zone_id == this.state.current_zone_id))];
                // this.state.tickets = this.state.tickets.filter(t => t.zone_id != this.state.current_zone_id);
                this.parent.refreshSummary();
                this.state.current_zone_id = -1;
				if(this.state.reloadPending) this.state.reload();
				return;
			}
        });

		// init seat click listeners
		this.showSeatsListeners();

		// preload default selections
		this.parent.refreshSummary();

		// get from backend
		this.parent.syncReservations();

		// scroll button listeners
        onClick('.kp-prev', e => { document.querySelector('#svg_mapping_cont').scrollLeft += 180; })
        onClick('.kp-prev', e => { document.querySelector('#svg_mapping_cont').scrollLeft -= 180; })
	}

	showSeatsListeners = () => {

        let self = this;
        let hall = this.state.hall_js;

		// single click listener
		let crtx = (e) => {

			// hide price variation cont
			document.querySelector('body').classList.remove('pvarshow');

			// let ticket_id = e.currentTarget.getAttribute('id').substr(1);
			// let z = parseInt(e.currentTarget.dataset.zone);
			// let s = e.currentTarget.dataset.index;

			let ticket_id = e.id;
			let z = parseInt(e.z);
			let s = e.s;

			// seat is booked, can not continue
			if(document.querySelector('#c'+ticket_id).classList.contains('booked'))
				return;

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
			}

			// load price variation picker
			if(pcfshtml){

				// seats mode without zone popup
				if(this.data.rendertype.value == 0){
							
					document.querySelector('#variation_cont ul.pvar').innerHTML = pcfshtml;

					// assign variation listeners
					onChange('#variation_cont ul.pvar input[type=radio]', e => {
						
						self.reserveSeat(ticket_id, z, s, parseFloat(e.currentTarget.value), e.currentTarget.dataset.label);
					});

					// cancel variable reservation if currently reserved
					if(document.querySelector('#c'+ticket_id).classList.contains("reserved")){ self.reserveSeat(ticket_id, z, s, '', ''); }else{ document.querySelector('body').classList.add('pvarshow'); }
			
				// seats mode with zone popup
				}else{
					
					document.querySelector('#variation_cont_zone ul.pvar').innerHTML = pcfshtml

					// assign variation listeners
					onChange('#variation_cont_zone ul.pvar input[type=radio]', e => {
						
						self.reserveSeat(ticket_id, z, s, parseFloat(e.currentTarget.value), e.currentTarget.dataset.label);

						document.querySelector('#variation_cont_zone').style.display = 'none';
					});

					document.querySelector('#variation_cont_zone').style.display = 'block';

					// user asks to close
					onClick('.var_toolbar_close .times', e => {

						document.querySelector('#variation_cont_zone').style.display = 'none';
					});
				}

			}else{

				this.reserveSeat(ticket_id, z, s, '', '');
			}

			// mark reserved seats
			this.parent.markBookings();
		}

		// delay single click when in POS managing booking mode to prevent double click conflict
		if(this.data.posmode.value == '2'){

			// console.log('click delayed');
			
			// seat click listeners
			onClick('.cr', e => { setTimeout(ee => { if(this.state.dblclick){ return; } crtx(ee); }, 400, { id: e.currentTarget.getAttribute('id').substr(1), z: parseInt(e.currentTarget.dataset.zone), s: e.currentTarget.dataset.index }) });
			onClick('.tx', e => { setTimeout(ee => { if(this.state.dblclick){ return; } crtx(ee); }, 400, { id: e.currentTarget.getAttribute('id').substr(1), z: parseInt(e.currentTarget.dataset.zone), s: e.currentTarget.dataset.index }) });

		}else{

			// seat click listeners
			onClick('.cr', e => { crtx({ id: e.currentTarget.getAttribute('id').substr(1), z: parseInt(e.currentTarget.dataset.zone), s: e.currentTarget.dataset.index }) });
			onClick('.tx', e => { crtx({ id: e.currentTarget.getAttribute('id').substr(1), z: parseInt(e.currentTarget.dataset.zone), s: e.currentTarget.dataset.index }) });
		}

		// seat admin dbl click listener
		let crtx_admin = (e) => {

			this.state.dblclick = true;
			setTimeout(e => { this.state.dblclick = false; }, 1000);
			
			if(this.state.debug) console.log('dbl click');

			// hide price variation cont
			document.querySelector('body').classList.remove('pvarshow');

			let ticket_id = e.currentTarget.getAttribute('id').substr(1);

			let z = parseInt(e.currentTarget.dataset.zone);
			let s = e.currentTarget.dataset.index;

			// cancel reservation
			if(document.querySelector("#c"+ticket_id).classList.contains("booked")){

				let l = confirm("Cancel booking?");
				if(l){
					
					document.querySelector("#c"+ticket_id).classList.remove("booked");
					let obj = { id: 's'+s, zone_id: parseInt(z), zone_text: "", path: 'z'+z+'s'+s, seat_id: parseInt(s), seat_text: (hall.areas[z].seats.points[s].t ? hall.areas[z].seats.points[s].t : s), seat_row: hall.areas[z].seats.points[s].r ? hall.areas[z].seats.points[s].r : '', price: 0, cfs: hall.cfs, type: "seat", render: this.data.rendertype.value};
					this.state.tickets_unbook.push(obj);
					this.parent.syncReservations();
				}

			// mark as reserved
			}else{

				let l = confirm("Mark as booked?");
				if(l){
					
					document.querySelector("#c"+ticket_id).classList.add("booked"); 
					let obj = { id: 's'+s, zone_id: parseInt(z), zone_text: "", path: 'z'+z+'s'+s, seat_id: parseInt(s), seat_text: (hall.areas[z].seats.points[s].t ? hall.areas[z].seats.points[s].t : s), seat_row: hall.areas[z].seats.points[s].r ? hall.areas[z].seats.points[s].r : '', price: 0, cfs: hall.cfs, type: "seat", render: this.data.rendertype.value};
					this.state.tickets_book.push(obj);
					this.parent.syncReservations();
				}
			}
		}

		// double click listener for admins to cancel reservations
		if(this.data.posmode.value == '2') [...document.querySelectorAll('.cr')].forEach(el => el.addEventListener("dblclick", e => crtx_admin(e)));
		if(this.data.posmode.value == '2') [...document.querySelectorAll('.tx')].forEach(el => el.addEventListener("dblclick", e => crtx_admin(e)));

		// select all seats listener
		if(this.data.posmode.value == '1' || this.data.posmode.value == '2') onClick('#seat_select_all', e => {

			[...document.querySelectorAll('#svg_mapping > g > circle')].forEach(el => {

				let ticket_id = el.getAttribute('id').substr(1);
				let z = parseInt(el.dataset.zone);
				let s = el.dataset.index;
				self.reserveSeat(ticket_id, z, s, '', '');


			});
		});
		
		// init pass picker
		this.state.picker = new PassPicker(self.parent);
		
		document.querySelector('#kp_image').style.opacity = 1;
    }

	reserveSeat = (ticket_id, z, s, p, t) => {

		let hall = this.state.hall_js;

		// add ticket
		if(!document.querySelector('#c'+ticket_id).classList.contains('reserved')){

			if(this.state.tickets.length > parseInt(this.state.ticketspbooking) && this.data.posmode.value == '0'){

                alert( __html('Adding more tickets is not allowed') );
				return;
			}

			let price = 0;
			let zone_text = hall.areas[z].seats.title;

			// default package listing price
			price = this.state.price;

			// zone price
			if(hall.areas[z].seats.price)
				if(parseFloat(hall.areas[z].seats.price.trim()) > 0)
					price = parseFloat(hall.areas[z].seats.price.trim());

			// price picker price
			if(!isNaN(p)) 
				if(p > 0) price = p;

			// individal seat seat price
			if(!isNaN(hall.areas[z].seats.points[s].p))
				if(parseFloat(hall.areas[z].seats.points[s].p.trim()) > 0)
					price = parseFloat(hall.areas[z].seats.points[s].p.trim());

			if(isNaN(price)) price = 0;

			// structure ticket object 
			let obj = { id: 's'+s, zone_id: parseInt(z), zone_text: zone_text, path: 'z'+z+'s'+s, seat_id: parseInt(s), seat_text: (hall.areas[z].seats.points[s].t ? hall.areas[z].seats.points[s].t : s)  + (t ? ' / ' + t : ''), seat_row: hall.areas[z].seats.points[s].r ? hall.areas[z].seats.points[s].r : '', price: price, cfs: hall.cfs, type: "seat", render: this.data.rendertype.value };

			// pass additional data to the ticket object such as price, custom fields, seat information 
			Object.keys(hall.areas[z].seats).map((key, index) => {
				
				// exclude seats key as it contains large data sets of unrelated data
				if(!this.state.exclude.includes(key)){ obj[key] = hall.areas[z].seats[key]; }
			});

			// console.log('addTicket');

			this.parent.addTicket(obj);

			// hide price variation cont
            document.querySelector('body').classList.remove('pvarshow');

		// unreserve seat
		}else{

            document.querySelector('#c'+ticket_id).classList.remove('reserved');
			this.parent.removeTicket('path', 'z'+z+'s'+s);
			// this.state.tickets_release = [...this.state.tickets_release, ...this.state.tickets.filter(t => (t.path == 'z'+z+'s'+s))];
            // this.state.tickets = this.state.tickets.filter(t => !(t.path == 'z'+z+'s'+s));
		}

		// refresh top bar tickets
		this.parent.refreshSummary();
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
}