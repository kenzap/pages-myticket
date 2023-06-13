// dependencies
import { H, __attr, __html, attr, html, onClick, setCookie, getCookie, parseApiError, spaceID, onChange } from '@kenzap/k-cloud';
import { priceFormat, getParam, CDN } from '../_/_helpers.js';
import { SeatsPicker } from "../_/_event_layout_seats_picker.js"

/**
 * @name ZonePicker
 * @description This class is responsible for whole zone selection. 
 * @param {Object} parent - parent class state, variables and methods.
 * @param {Object} z - selected zone ID.
 * 
 * @returns {Instance}
 */
export class ZonePicker{

    // init class
    constructor(parent){
    
		this.parent = parent;
		this.state = parent.state; // parent variables
		this.data = parent.data;   // layout settings data
    }

	zoneMap = () => {

		let hall = this.state.hall_js;
        let kp_svg = document.querySelector(".kp_svg");
        let i = 0;

		// hall_js.passes = {};
		hall.areas.map((item, z) => {

			// generate DOM elements
			let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');

			// draw zone overlay polygon 
			polygon.setAttribute('points', item.coords.points.map((item) => { return item.x / this.state.polygon_scale + " " + item.y / this.state.polygon_scale; }));
			polygon.setAttribute('data-index', i);
			polygon.setAttribute('id', "pl"+i);
			g.appendChild(polygon);
			kp_svg.append(g);
			i++;

			let tns = 0, tws = 0; 
			
			// populate passes array
			if (hall.areas[z].seats){

				// total seats per zone
				tns = parseInt(hall.areas[z].seats.tns);
				tws = parseInt(hall.areas[z].seats.tws);

				if(hall.areas[z].passes === undefined) hall.areas[z].passes = [];

				let s = 0;
				while (s < tns){

					hall.areas[z].passes.push({id: "p"+parseInt(s+tws)+'z'+z, uid: "", class: ""});
					s++;
				}
			}

			// fade in
			document.querySelector("#kp_image").style.opacity = '1';
	
			return item;
		});

		// zone click listener
		let plcl = (e) => {

			let z = e.z;

			// ignore clicks if zone is fully booked
			if(!e.booked){

				if(!hall.areas[z]) return;

				// single click full zone reservation mode
				if(!hall.areas[z].seats){

					this.reserveZoneIntent(z);

				}else if(hall.areas[z].seats.tws == 0 && hall.areas[z].seats.tns == 1){

					this.reserveZoneIntent(z);

				// seat selection moda;
				}else{

					this.state.seats = new SeatsPicker(this.parent, z);
				}
			}else{

				// zone is not opened
				this.state.current_zone_id = -1;
			}
		}

		// zone admin dbl click listener
		let plcl_admin = (e) => {

			this.state.dblclick = true;
			setTimeout(e => { this.state.dblclick = false; }, 1000);
			
			if(this.state.debug) console.log('dbl click');

			let z = parseInt(e.currentTarget.dataset.index);

			// cancel reservation
			if(document.querySelector("#pl"+z).classList.contains("booked")){

				let l = confirm("Cancel booking?");
				if(l){
					
					document.querySelector("#pl"+z).classList.remove("booked");
					let obj = { id: 'z'+z, zone_id: parseInt(z), title: hall.areas[z].seats.title, price: 0, cfs: hall.cfs, path: 'z'+z, type: "zone", render: this.data.rendertype.value, admin: 0 };
					this.state.tickets_unbook.push(obj);
					this.parent.syncReservations();
				}

			// mark as reserved
			}else{

				let l = confirm("Mark as booked?");
				if(l){
					
					document.querySelector("#pl"+z).classList.add("booked"); 

					let obj = { id: 'z'+z, zone_id: parseInt(z), title: hall.areas[z].seats.title, price: 0, cfs: hall.cfs, path: 'z'+z, type: "zone", render: this.data.rendertype.value, admin: 1 };
					this.state.tickets_book.push(obj);
					this.parent.syncReservations();
				}
			}

			// zone is not opened
			this.state.current_zone_id = -1;
		}
		
		// delay single click when in POS managing booking mode to prevent double click conflict
		if(this.data.posmode.value == '2'){

			console.log('click delayed');
			
			// mode 0 add layout zone seat preview event
			onClick("polygon", e => {

				let z = e.currentTarget.dataset.index;

				this.state.current_zone_id = z;

				let booked = e.currentTarget.classList.contains("booked");

				setTimeout((ee) => { if(this.state.dblclick){ return; } plcl(ee) }, 400, {z: z, booked: booked});
			});

			// double click listener for admins to cancel reservations
			[...document.querySelectorAll('polygon')].forEach(el => el.addEventListener("dblclick", e => plcl_admin(e)));
			
		}else{

			// mode 0 add layout zone seat preview event
			onClick("polygon", e => {

				let z = e.currentTarget.dataset.index;

				this.state.current_zone_id = z;

				let booked = e.currentTarget.classList.contains("booked");

				setTimeout((ee) => { if(this.state.dblclick){ return; } plcl(ee) }, 0, {z: z, booked: booked});
			});
		}
	}

	reserveZoneIntent = (z) => {

        // console.log(this.state.ticketspbooking + 'zone:' + z);
		let hall = this.state.hall_js;

        // check if already reserved
        let reserved = this.state.tickets.filter(t => t.zone_id == z);

        // unreserve zone and finish here
        if(reserved.length == 1){

            this.reserveZone(z);
            return;
        }

        // check if not exceeding max allowed 
        if(this.state.tickets.length >= this.state.ticketspbooking && this.data.posmode.value == '0'){

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
            
        }

        // load price variation picker
        if(pcfshtml){

			document.querySelector('#variation_cont_zone ul.pvar').innerHTML = pcfshtml;

            // assign variation listeners
			onChange('#variation_cont_zone ul.pvar input[type=radio]', e => {

				document.querySelector('#variation_cont_zone').style.display = 'none';
			});

			document.querySelector('#variation_cont_zone').style.display = 'block';

            // user asks to close
			onClick('.var_toolbar_close .times', e => {

				document.querySelector('#variation_cont_zone').style.display = 'none';
			});

        }else{

            this.reserveZone(z);
        }
    }

	// reserve unreserve full zone
	reserveZone = (z) => {

		let hall = this.state.hall_js;

		// get reserved tickets
		let reserved = this.state.tickets.filter(t => t.zone_id == z);

		// unreserve
		if(reserved.length == 1){

			// remove zone from tickets
			this.parent.removeTicket('zone', z);
			// this.state.tickets_release = [...this.state.tickets_release, ...this.state.tickets.filter(t => (t.zone_id == z))];
			// this.state.tickets = this.state.tickets.filter(t => !(t.zone_id == z));

			// mark zone as free instantly 
			document.querySelector("#pl"+z).classList.remove('selected');

		// reserve	
		}else{

			// check if not exceeding max allowed 
			if(this.state.tickets.length >= this.state.ticketspbooking && this.data.posmode.value == '0'){

				alert( __html('Adding more tickets is not allowed'))
				this.state.current_zone_id = -1;
				return;
			}

			// zone is not assigned skip reservation request
			if(!hall.areas[z].seats) hall.areas[z].seats = { title: __html('Zone %1$', z), tws: 0, tns: 1, price: this.state.price }

			// calc price
			let price = parseFloat(hall.areas[z].seats.price ? hall.areas[z].seats.price : this.state.price);
			if(isNaN(price)) price = 0;

			// structure ticket object 
			let obj = { id: 'z'+z, zone_id: parseInt(z), title: hall.areas[z].seats.title, price: price, cfs: hall.cfs, path: 'z'+z, type: "zone", render: this.data.rendertype.value };

			// pass additional data to the ticket object such as price, custom fields, seat information 
			Object.keys(hall.areas[z].seats).map((key, index) => {
				
				// exclude seats key as it contains large data sets of unrelated data
				if(!this.state.exclude.includes(key)){ obj[key] = hall.areas[z].seats[key]; }
			});

			// push object to ticket global array
			this.parent.addTicket(obj);
			
			// mark zone as reserved instantly
			document.querySelector("#pl"+z).classList.add('selected');
			// $("#pl"+z).addClass("selected");
		}

		this.parent.refreshSummary();

		this.state.current_zone_id = -1;
	}
}