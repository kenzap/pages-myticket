// dependencies
import { H, __attr, __html, attr, html, onClick, setCookie, getCookie, parseApiError, spaceID, onChange } from '@kenzap/k-cloud';
import { priceFormat, getParam, CDN } from '../_/_helpers.js';
import { SeatsPicker } from "../_/_event_layout_seats_picker.js"
import { ZonePicker } from "../_/_event_layout_zone_picker.js"

/**
 * @name Layout
 * @description This class is responsible for hall layout rendering.
 * Layouts are defined in https://myticket.kenzap.cloud/layout-list/
 * @param {Object} data - parent variables
 * @param {Object} state - parent class state
 * 
 * @returns {Instance}
 */
export class Layout{

    // init class
    constructor(data, state){
    
        this.state = state;
        this.data = data;

        this.init();
    }

    init = () => {

        let img = document.querySelector("#myticket_img");
        img.style.position = 'absolute';

        // adjust layout proportions with the browsers screen
        let mwidth = img.width;
        let mheight = img.height;
        document.querySelector("#kp_image").style.width = mwidth;
        document.querySelector("#svg").style.width = mwidth;
        document.querySelector("#svg").style.height = mheight;
        this.state.polygon_scale = this.state.hall_js.img_width / parseInt(mwidth);
        
		// set sync reservations timer
		this.state.myticketCalls = setInterval(this.syncReservations, 5000, true);

        // switch layout rendering scenarious
        switch(this.data.rendertype.value){

            // mode 1 overlay hall layout image with interactive seat polygons
            case 'seat':

				this.state.seats = new SeatsPicker(this, -1);

				this.state.seats.seatMap();

            break;
            // mode 0 overlay hall layout image with interactive zone polygons
            case 'zone':

				this.state.zones = new ZonePicker(this);

                this.state.zones.zoneMap();
            break;
        }

        // restore sumary table after refresh
        this.refreshSummary();

		// get latest reservations
		this.syncReservations();
    }

    refreshSummary = () => {

		// selected package index
        sessionStorage.setItem("tickets_"+this.state.response.event._id+"_"+sessionStorage.getItem('date_select'), JSON.stringify(this.state.tickets));

        if(document.querySelector('.selected_seats')) document.querySelector('.selected_seats').innerHTML = "";

        // get default summary table
        if(!this.state.summary_table) this.state.summary_table = document.querySelector('.kp-ticket-row').innerHTML;

        let hall = this.state.hall_js;
        let zone_id = this.state.current_zone_id;
		let kp_ticket_rows = '';
		let totals = { total: 0 };
		let output = this.state.tickets.map((item) => {

			let ticket_id = item.seat_id + 'z' + item.zone_id;
            let fields, summary_table_row;

			// available summary table key value fields 
			let summary_table_fields = {}
			if(hall.areas[item.zone_id] && hall.areas[item.zone_id].seats) Object.keys(hall.areas[item.zone_id].seats).map((key, index) => { if(!this.state.exclude.includes(key)){ summary_table_fields['{{ticket_'+key+'}}'] = hall.areas[item.zone_id].seats[key]; } });

			switch(item.type){

				case 'seat':

					if(!hall.areas[item.zone_id]) return;

					if(!hall.areas[item.zone_id].seats) return;
		
					// structure summary table
					summary_table_row = 
					`<tr>
						<td>
							<div class="details">
								${ item.seat_text ? '<div>' + __html('Seat %1$', item.seat_text) + '</div>': '' }
								${ item.seat_row ? '<div>' + __html('Row %1$', item.seat_row) + '</div>': '' }
								${ item.zone_text ? '<div>' + __html('Zone %1$', item.zone_text) + '</div>': '' }
								${ item.cfs.map(c => {

									return item[c.id] ? '<div>' + __html(c.label+' %1$', item[c.id]) + '</div>' : ''

								 }).join('')
								}
								${ 
									// TODO consider removing
									item.cfs.length == -1 ? '<div>' + __html('Zone %1$', item.zone_text) + '</div>': '' 
								}
					
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

					totals.total += item.price;

					// return only previewd zone seats
					if(item.price) if(zone_id == item.zone_id) return item.seat_text + " " + priceFormat(this.state.response.event, item.price)+" &nbsp;&nbsp;";
					if(zone_id == item.zone_id) return item.seat_text;
					
				break;
				case 'zone':

					if(!hall.areas[item.zone_id]) return;

					if(!hall.areas[item.zone_id].seats) hall.areas[item.zone_id].seats = { title: __html('Zone %1$', item.zone_id), tws: 0, tns: 1, price: this.state.price };

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

					for(let f in fields){ summary_table_row = summary_table_row.replaceAll(f, fields[f]); }

					kp_ticket_rows += summary_table_row;

					document.querySelector("#pl"+item.zone_id).classList.add('selected');

					totals.total += item.price;

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
								${ '<div>' + __html('Ticket #%1$ to %2$', item.pass_text, item.zone_text) + '</div>' }
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
					
					for(let f in fields){ summary_table_row = summary_table_row.replaceAll(f, fields[f]); }

					kp_ticket_rows += summary_table_row;

					// make sure record exists
					if(hall.areas[item.zone_id].passes === undefined){
						hall.areas[item.zone_id].passes = [];
						hall.areas[item.zone_id].passes.push({id: "p1z"+item.zone_id, uid: "", class: ""});
					}

					totals.total += item.price;

					if(item.price.length > 0) if(zone_id == item.zone_id) return item.pass_number + ' ' + item.zone_text + ' ' + priceFormat(this.state.response.event, item.price)+" &nbsp;&nbsp;";
					if(zone_id == item.zone_id) return __html('Ticket #%1$ to %2$', item.pass_text, item.zone_text) ;

				break;
			}
		}).join(' ');

		if(kp_ticket_rows==''){

            document.querySelector('.kp-btn-reserve').style.display = 'none';
            document.querySelector('.kp-table').style.display = 'none';
		}else{

			document.querySelector('.kp-btn-reserve').dataset.price = totals.total;
			document.querySelector('.kp-btn-reserve').innerHTML = html(document.querySelector('.kp-btn-reserve').dataset.text) + ' <span>(' + priceFormat(this.state.response.event, totals.total) + ')</span>';
            document.querySelector('.kp-btn-reserve').style.display = 'block';
            document.querySelector('.kp-table').style.display = 'block';
		}

		// trim last space and coma 
		if(typeof(hall.areas[zone_id]) !== 'undefined' && document.querySelector('.seat_head .row1') &&  hall.areas[zone_id].seats.title) document.querySelector('.seat_head .row1').innerHTML = "<b>" + hall.areas[zone_id].seats.title + "</b>";
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
				this.removeTicket('path', path);
                this.refreshSummary();
            }
        });
	}

    markBookings = () => {

		// mark booked seats for current zone
		let hall = this.state.hall_js;
		let zone_id = this.state.current_zone_id;

		// reservation object is empty, nothing to do
		if(!this.state.reservations) return;

		// switch layout rendering scenarious
		switch(this.data.rendertype.value){

			// seat mode - mark booked seats
			case 'seat':

				// clear currend bookings
				[...document.querySelectorAll(".cr")].forEach(el => el.classList.remove("booked"));

				// mark reserved seats
				hall.areas.map((item, z) => {

					// map seats
					let tws = 0;
					if(hall.areas[z].seats){
			
						// total seats per zone
						tws = hall.areas[z].seats.tws;
			
						let s = 0;
						while(s < tws){

							if(this.state.reservations["s"+s]) if(this.state.reservations["s"+s][0]['s'] == 5 || (this.state.reservations["s"+s][0]["u"] != this.state.myticketUserId && this.state.reservations["s"+s][0]['s'] == 3)){
									
								// mark as booked visually
								let ticket_id = s+'z'+z;
								document.querySelector('#c'+ticket_id).classList.add('booked');
								document.querySelector('#t'+ticket_id).classList.add('booked');

								// remove from tickets
								this.removeTicket('path', 'z'+z+'s'+s);
							}
							s++;
						}
					}
				});

			break;

			// zone mode - mark booked seats
			case 'zone':

				// mark reserved zones
				if(this.state.reservations_mode == 'zone-stats'){

					for (let i = 0; i < hall.areas.length; i++){
			
						let tws = 0, tns = 0;
						if (!hall.areas[i].seats) continue

						tws = hall.areas[i].seats.tws ? parseInt(hall.areas[i].seats.tws) : 0;
						tns = hall.areas[i].seats.tns ? parseInt(hall.areas[i].seats.tns) : 0;

						// get reserved tickets
						let reserved = this.state.tickets.filter(t => t.zone_id == i);

						// set defaults
						// if(this.state.reservations_mode == 'zone-stats'){

							if(document.querySelector("#pl"+i)) document.querySelector("#pl"+i).classList.remove("booked");
							if(document.querySelector("#pl"+i)) document.querySelector("#pl"+i).classList.remove("selected");
						// }

						// zone with seats and passes fully reserved
						if(reserved.length == tws+tns) if(document.querySelector("#pl"+i)) document.querySelector("#pl"+i).classList.add("selected");

						// no aggregated data about this zone, skip iteration
						if(!this.state.reservations["z"+i]) continue;

						// zone without seats and passes fully booked
						if(tns == 1 && tws == 0){

							if(this.state.reservations["z"+i]['rc'] == tns && !this.state.reservations["z"+i]['u'].includes(this.state.myticketUserId) || this.state.reservations["z"+i]['bc'] == tns) if(document.querySelector("#pl"+i)) document.querySelector("#pl"+i).classList.add('booked');
						}

						// zone with passes only fully reserved
						if(tns > 1 && tws == 0){

							// console.log("z"+i)
							// console.log(this.state.reservations["z"+i]['u'])
							if(this.state.reservations["z"+i]['rc'] == tns && !this.state.reservations["z"+i]['u'].includes(this.state.myticketUserId) || this.state.reservations["z"+i]['bc'] == tns) if(document.querySelector("#pl"+i)) document.querySelector("#pl"+i).classList.add('booked');
						}

						// zone is marked as booked
						if(this.state.reservations["z"+i]['booked']) if(this.state.reservations["z"+i]['booked'] == 1) if(document.querySelector("#pl"+i)) document.querySelector("#pl"+i).classList.add("booked");
												
						// zone fully booked TODO should be removed?
						// if(typeof(this.state.reservations_zones[i]) !== 'undefined')
						// 	if(parseInt(this.state.reservations_zones[i].count) == tws+tns) if(document.querySelector("#pl"+i)) if(document.querySelector("#pl"+i)) document.querySelector("#pl"+i).classList.add("booked"); // $("#pl"+i).addClass("booked");
					}
				}

				if(this.state.reservations_mode == 'zone-single'){

					// clear currend bookings
					[...document.querySelectorAll(".cr")].forEach(el => el.classList.remove("booked"));

					// mark reserved seats
					let tws = 0, tns = 0;
					if(!hall.areas[zone_id]) break;
					tws = hall.areas[zone_id].seats.tws;
					tns = hall.areas[zone_id].seats.tns;
					let i = 0;
					while(i < tws){
		
						let refreshSummary = false;

						if(this.state.reservations["z"+zone_id+"s"+i] && this.state.debug) console.log(this.state.reservations["z"+zone_id+"s"+i]);

						// block when ticket is booked or served by other users
						// if(this.state.reservations["z"+zone_id+"s"+i]) if(this.state.reservations["z"+zone_id+"s"+i][0]['s'] == 5 || (this.state.reservations["z"+zone_id+"s"+i][0]['u'] != this.state.myticketUserId && this.state.reservations["z"+zone_id+"s"+i][0]['s'] == 3)){
						if(this.state.reservations["z"+zone_id+"s"+i]) if(this.state.reservations["z"+zone_id+"s"+i]['s'] == 5 || (this.state.reservations["z"+zone_id+"s"+i]['u'] != this.state.myticketUserId && this.state.reservations["z"+zone_id+"s"+i]['s'] == 3)){
		
							// mark as booked visually. Ex id: 0_0z0 (if type is a seat)
							document.querySelector("#c"+i+"z"+zone_id).classList.add('booked');
							document.querySelector("#t"+i+"z"+zone_id).classList.add('booked');

							// remove from current user if tickets were already reserved by someone else. TODO notify and refresh topbar.
							if(this.state.tickets.filter(t => (t.path == 'z'+zone_id+'s'+i))){ refreshSummary = true; } //toast( __html('Some of your tickets were just booked!') )
							this.removeTicket('path', 'z'+zone_id+'s'+i);

							if(refreshSummary) this.refreshSummary();
							// this.state.tickets = this.state.tickets.filter(t => (t.path != 'z'+zone_id+'s'+i));
						}
						
						i++;
					}

					// refresh max number of passes
					if(tns > 1 && tws == 0 && this.state.picker) this.state.picker.refresh();
				}
			break;
		}
	}

	addTicket = (obj) => {

		if(this.state.debug) console.log(obj);
		
		this.state.tickets.push(obj);
		// remove from release queue, to ensure data integrity sequence
		this.state.tickets_release = this.state.tickets_release.filter(t => !(t.path == obj.path));

		this.syncReservations();
	}

	removeTicket = (by, val) => {

		switch(by){

			case 'zone':
				this.state.tickets_release = [...this.state.tickets_release, ...this.state.tickets.filter(t => (t.zone_id == val))];
				this.state.tickets = this.state.tickets.filter(t => !(t.zone_id == val));
			break;
			case 'path':
				this.state.tickets_release = [...this.state.tickets_release, ...this.state.tickets.filter(t => (t.path == val))];
				this.state.tickets = this.state.tickets.filter(t => !(t.path == val));
			break;
		}

		this.syncReservations();
	}

	syncReservations = () => {

		let self = this;
		let reserve = false;

		// restrict to one query per user per second 
		if(((new Date()).getTime() - self.state.pending_reservation_timeout) < 1000){ return; }

		self.state.pending_reservation_timeout =(new Date()).getTime();

		// create reservation request
		let bookings = {
			type: "sync-reservations",
			event_id: self.state.response.event._id, //getParam('id'),
			package_id: sessionStorage.getItem('date_select'),
			user_id: sessionStorage.getItem('myticket_user_id'),
			zone_id: self.state.current_zone_id,
			render_type: self.data.rendertype.value
		}

		// prioritize POS mode booking requests first if they are present
		if(self.state.tickets_book.length || self.state.tickets_unbook.length){

			bookings.tickets_book = self.state.tickets_book;
			bookings.tickets_unbook = self.state.tickets_unbook;

		// user reservation requests
		}else{

			bookings.tickets_reserve = self.state.tickets_reserve;
			bookings.tickets_release = self.state.tickets_release;
		}

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
                    bookings: bookings
                }
            })
        })
        .then(response => response.json())
        .then(response => {

			self.state.pending_reservations = false;
			// self.state.tickets_reserve = [];
			
			if(self.state.tickets_book.length || self.state.tickets_unbook.length){

				self.state.tickets_book = [];
				self.state.tickets_unbook = [];
			}else{
				self.state.tickets_release = [];
			}

            if(response.success){

				self.state.reservations = response.bookings.data;
				self.state.reservations_mode = response.bookings.mode;
				self.markBookings();

				// // init seat click listeners after first load
				// if(self.data.rendertype.value == 1){

				// 	console.log('seatListeners'); 
				// }
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