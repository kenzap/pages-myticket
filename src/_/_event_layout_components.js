// dependencies
import { H, __attr, __html, attr, html, onClick, setCookie, getCookie, parseApiError, spaceID, onChange } from '@kenzap/k-cloud';
import { priceFormat, getParam, CDN } from '../_/_helpers.js';

export class PassPicker{

    // init class
    constructor(parent){
    
		this.parent = parent;
		this.state = parent.state;
		this.data = parent.data;

        this.init();
    }

    init = () => {
       
		let self = this;
		let hall = this.state.hall_js;
		let z = this.state.current_zone_id;
		let tns = parseInt(hall.areas[z].seats.tns);
		if(!this.state.reservations) this.state.reservations = [];

		// passes - create picker if empty
		if(tns > 1) if(document.querySelector(".picker_select").innerHTML.length < 10){

			let p = 0, picker = "";
			let passes = this.state.tickets.filter(t => (t.zone_id == z));
			let booked = this.getPassBookings();

			console.log(tns);

			// while(p <= (i - bi) && p <= this.state.ticketspbooking){
			while(p <= this.state.ticketspbooking && p <= tns){

				picker += '<option style="'+(p > (tns - booked.length) ? 'display:none;' : '')+'" value="'+p+'" '+( passes.length == p ? 'selected' : '' )+' >'+p+'</option>';
				p++;
			}

			document.querySelector(".picker_select").innerHTML = picker; // $(".picker_select").html(picker);
			document.querySelector(".picker_select").dataset.l = p; // $(".picker_select").html(picker);

			// number pick listener
			if(!document.querySelector(".picker_select").dataset.listener) onChange('.picker_select', e => {

				this.update();
			});
		}
    }

	update = () => {

		let self = this;
		let hall = this.state.hall_js;
		let z = parseInt(this.state.current_zone_id);
		let tns = parseInt(hall.areas[z].seats.tns);

		document.querySelector(".picker_select").dataset.listener = true;

		let ti = parseInt(document.querySelector(".picker_select").value), i = 0;

		console.log(document.querySelector(".picker_select").value + ' - picker_select' + ti);

		// remove all prev tickets first
		this.parent.removeTicket('zone', z);
		// while(tns > i){
			
			
		// 	i++;
		// }

		// add new tickets
		i = 0;
		while(ti > i){

			let obj = { id: 'p'+i, pass_number: ti, pass_index: i, pass_text: i+1, zone_id: z, zone_text: hall.areas[z].seats.title, path: 'z'+z+'p'+i, title: hall.areas[z].seats.title, price: parseFloat(hall.areas[z].seats.price ? hall.areas[z].seats.price : this.state.price), cfs: hall.cfs, type: "pass", render: this.data.rendertype.value };
			Object.keys(hall.areas[z].seats).map((key, index) => {
						
				// exclude seats key as it contains large data sets of unrelated data
				if(!self.state.exclude.includes(key)){ obj[key] = hall.areas[z].seats[key]; }
			});

			this.parent.addTicket(obj);
			
			i++;
		}

		// refresh top bar tickets
		this.parent.refreshSelectedTicket();

		// mark reserved seats
		this.parent.markBookings();

	}

	refresh = () => {

		// picker was destroyed, modal closed case
		if(!document.querySelector(".picker_select")) return;

		let z = this.state.current_zone_id;
		let tns = parseInt(this.state.hall_js.areas[z].seats.tns);
		
		if(tns < 1) return;

		let bookings = this.getPassBookings();
		// console.log('picker refresh ');
		// console.log(bookings);
		
		let maxAllowed = this.state.ticketspbooking;
		if(tns - bookings.length < maxAllowed) maxAllowed = tns - bookings.length;
	
		// console.log('maxAllowed' + maxAllowed + " l " + parseInt(document.querySelector(".picker_select").dataset.l));

		// refresh number of available passes
		if(parseInt(document.querySelector(".picker_select").dataset.l) != maxAllowed){

			// optontion visibility 
			// document.querySelector(".picker_select").value = maxAllowed;
			document.querySelector(".picker_select").dataset.l = maxAllowed;

			let i = 0;
			while(i <= this.state.ticketspbooking && i <= tns){

				if(i > maxAllowed){

					document.querySelector('.picker_select > option[value="'+i+'"]').style.display = 'none';
				}else{

					document.querySelector('.picker_select > option[value="'+i+'"]').style.display = 'block';
				}
				i++;
			}

			// current value is more than allowed
			if(parseInt(document.querySelector(".picker_select").value) > maxAllowed){

				document.querySelector(".picker_select").value = maxAllowed;
				this.update();
			}
		};
	}

	getPassBookings = () => {

		let z = this.state.current_zone_id;
		if(!this.state.reservations["z"+z]) return [];
		if(Array.isArray(this.state.reservations["z"+z])) return this.state.reservations["z"+z].filter(t => t == 5 || t["u"] != this.state.myticketUserId && t['s'] == 3);
		return [];
	}
}