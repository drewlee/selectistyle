/*
* Selectistyle jQuery Plugin v1.3
*
* Copyright (c) 2012 Andrew A. Lee
*
* Dual licensed under the MIT and GPL licenses, located in
* MIT-LICENSE.txt and GPL-LICENSE.txt respectively.
*
* Wed Apr 11 2012 00:34:10 GMT-0500 (CDT)
*/
;(function($){
var $doc,
	counter = 0,
	Selectistyle = function(){};

Selectistyle.prototype = {
	init: function($sel, st){
		this.$sel = $sel;
		this.st = st;
		this.cls = 'ssd-active';
		this.dCls = this.st.prefix + '-disabled';
		this.wCls = this.st.prefix + '-active';
		this.focusCls = 'ssd-focus';
		this.$hilited = [];
		this.htSet = false;
		this.sIdx = 0;
		
		this.build();
		this.bindEvents();
		
		this.$current = this.$dd.find('li.ssa-active');
		
		if(this.$sel.is(':disabled')){this.disable();}
	},
	build: function(){
		this.generateIds();
		this.generateHtml();
		this.insertSrc();
	},
	generateIds: function(){
		var id = this.$sel[0].id,
			cls = this.st.prefix + '_',
			ids = {
				sId:   id,
				cId:   cls + 'container_' + id,
				aId:   cls+ 'a_' + id,
				divId: cls + 'div_' + id,
				ulId:  cls + 'ul_' + id
			};

		this.ids = ids;
	},
	generateHtml: function(){
		var elem = this.$sel[0],
			ids = this.ids,
			cls = this.st.prefix + '-',
			sIdx = elem.selectedIndex,
			opts = elem.options;
		
		this.optsLength = opts.length;
		this.sIdx = sIdx;
		
		var html = '<div id="' + ids.aId + '" class="' + cls + 'hotspot" tabindex="' + elem.tabIndex + '">\n'
			+ '<span class="' + cls + 'arrow"></span>\n'
			+ '<span class="' + cls + 'text">' + opts[sIdx].text + '</span>\n'
			+ '</div>\n'
			+ '<div id="' + ids.divId + '" class="' + cls + 'div" style="display:none;">\n'
			+ '<ul id="' + ids.ulId + '" class="' + cls + 'ul">\n';
		
		for(var i=0; opts[i]; i++){
			html += '<li class="' + cls + 'li' + (i === sIdx ? ' ssa-active' : '') + (i === 0 ? ' ssa-first' : '') + '">'
				+ '<a class="' + cls + 'a">' + opts[i].text + '</a>'
				+ '</li>\n';
		}
		
		html += '</ul>\n</div>\n';
		
		this.html = html;
	},
	insertSrc: function(){
		var $sel = this.$sel,
			wdth = $sel.outerWidth() + this.st.widthAdj;
		
		$sel.hide()
			.wrap('<div id="' + this.ids.cId + '" class="' + this.st.prefix + '-container" style="width:' + wdth + 'px;" />')
			.parent()
			.append(this.html);
	},
	bindEvents: function(){
		this.$wrap = $('#' + this.ids.cId);
		this.$a  = $('#' + this.ids.aId);
		this.$dd = $('#' + this.ids.divId);
		this.$ul = $('#' + this.ids.ulId);
		this.$textbox = this.$a.find('span.' + this.st.prefix + '-text');

		this.$a.bind({
			mousedown: $.proxy(this.evtHandleMouseDown, this),
			focus: $.proxy(this.evtHandleFocus, this),
			blur: $.proxy(this.evtHideDropDown, this),
			keydown: $.proxy(this.evtHandleKeys, this),
			click: function(e){
				e.preventDefault();
				e.stopPropagation();
			}
		});
		
		this.$dd
			.bind('mousedown', $.proxy(this.evtHandleDropDown, this));
	},
	evtHandleKeys: function(e){
		if(!this.$dd.hasClass(this.cls)){return;}
		
		switch(e.keyCode){
			// up key
			case 38:
				this.eHelperHandleArrowKey(e, -1);
				break;
			// down key
			case 40:
				this.eHelperHandleArrowKey(e, 1);
				break;
			// enter key
			case 13:
				this.eHelperHandleEnterKey(e);
				break;
		}
	},
	eHelperHandleArrowKey: function(e, delta){
		e.preventDefault();
		
		var $dd = this.$dd,
			$current = this.$hilited,
			$adjacent = [];
		
		if($current.length){
			$adjacent = delta > 0 ? $current.next() : $current.prev();
			$current.removeClass(this.focusCls);
		}else{
			$adjacent = $dd.find('li.ssa-active')[delta > 0 ? 'next' : 'prev']();
		}
		
		if(!$adjacent.length){
			$adjacent = delta > 0 ? $dd.find('li:first-child') : $dd.find('li:last-child');
		}
		
		$adjacent.addClass(this.focusCls);
		
		this.scrollIntoView($adjacent);
		this.$hilited = $adjacent;
	},
	eHelperHandleEnterKey: function(e){
		e.preventDefault();
		
		var $current = this.$hilited;
		
		if($current.length){
			$current.find('a').mousedown();
		}
		
		this.$dd.click();
		this.$a.blur();
	},
	evtHideDropDown: function(e){
		if(e && e.type == 'click'){
			if($doc){$doc.unbind('click', this.evtHideDropDown);}
			this.eHelperBindTrigger();
		}
		
		this.$wrap.removeClass(this.wCls);
		this.$dd
			[this.st.offEffect](this.st.speed)
			.removeClass(this.cls);
			
		if(this.$hilited.length){
			this.$hilited.removeClass(this.focusCls);
			this.$hilited = [];
		}
	},
	evtHandleMouseDown: function(e){
		if(this.$dd.hasClass(this.cls)){
			this.evtHideDropDown({type: 'click'});
		}else{
			this.eHelperUnbindTrigger();
			this.eHelperShowDropDown();
			
			if(!$doc){$doc = $(document);}
			$doc.bind('click', $.proxy(this.evtHideDropDown, this));
		}
	},
	evtHandleFocus: function(e){
		this.eHelperShowDropDown();
	},
	eHelperBindTrigger: function(){
		this.$a.bind({
			focus: $.proxy(this.evtHandleFocus, this),
			blur:  $.proxy(this.evtHideDropDown, this)
		});
	},
	eHelperUnbindTrigger: function(){
		this.$a.unbind({
			focus: this.evtHandleFocus,
			blur: this.evtHideDropDown
		});
	},
	eHelperShowDropDown: function(){
		var $active = this.$ul.find('li.ssa-active');

		this.$wrap.addClass(this.wCls);
		this.$dd
			[this.st.onEffect](this.st.speed)
			.addClass(this.cls);
		
		this.setHeight();
		
		this.$ul.scrollTop(0);
		this.scrollIntoView($active);
	},
	evtHandleDropDown: function(e){
		var $tget = $(e.target),
			$sel = this.$sel,
			$a = this.$a,
			cback = this.st.callback,
			$li, txt, idx, cls = 'ssa-active';
		
		if($tget.closest('a').length){
			$tget = $tget.closest('a');
			$li = $tget.parent();
			
			if($li.hasClass(cls)){return;}
			
			this.$current.removeClass(cls);
			$li.addClass(cls);
			this.$current = $li;
			
			idx = $li.index();
			txt = $tget.text();
			
			this.$textbox.text(txt);
			$sel[0].selectedIndex = idx;
			
			$sel.change();
			
			if(cback && typeof cback == 'function'){
				cback($sel, $sel[0].value, txt);
			}
		}
	},
	setHeight: function(){
		if(this.htSet){return;}
		
		this.liHt = this.$ul.find('li:eq(1)').outerHeight();
		this.ulHt = (this.st.maxView > 0 && this.optsLength > this.st.maxView) ? (this.liHt * this.st.maxView) : 'auto';
		
		this.$ul.css('height', this.ulHt);
		
		this.htSet = true;
	},
	scrollIntoView: function($adjacent){
		if(this.ulHt == 'auto'){return;}
		
		var $ul = this.$ul,
			topPos = $adjacent.position().top,
			ddHt = this.ulHt,
			sTop = $ul.scrollTop();
		
		if(topPos >= ddHt){
			this.$ul.scrollTop(sTop + topPos);
		}else if(topPos < 0){
			this.$ul.scrollTop(sTop + topPos - ddHt + this.liHt);
		}
	},
	enable: function(){
		var domSel = this.$sel[0];
		
		domSel.disabled = false;
		this.$a
			.bind({
				mousedown: $.proxy(this.evtHandleMouseDown, this),
				focus: $.proxy(this.evtHandleFocus, this)
			})
			.get(0).tabIndex = domSel.tabIndex;
			
		this.$wrap.removeClass(this.dCls);
	},
	disable: function(){
		this.$sel[0].disabled = true;
		this.$a
			.unbind({
				mousedown: this.evtHandleMouseDown,
				focus: this.evtHandleFocus
			})
			.get(0).tabIndex = -1
			
		this.$wrap.addClass(this.dCls);
	},
	destroy: function(){
		this.$wrap
			.before(this.$sel)
			.remove();
		
		this.$sel.show();
	},
	reset: function(){
		this.$dd
			.find('li:eq(' + this.sIdx + ')')
			.find('a')
			.trigger('mousedown');
	}
};

$.extend(Selectistyle, {
	init: function(opts){
		var instance,
			st = {
				prefix: 'selectistyle',
				onEffect: 'fadeIn',
				offEffect: 'fadeOut',
				speed: 'medium',
				widthAdj: 0,
				maxView: 0,
				callback: null
			};
		
		$.extend(st, opts || {});
    
		this.each(function(){
			if('selectistyle' in $.data(this)){return;}
			if(!this.id){this.id = 'selectid_' + counter++}
			
			instance = new Selectistyle;
			instance.init($(this), st);
			
			$.data(this, 'selectistyle', instance);
		});	
	},
	enable: function(method){
		this.each(function(){
			if('selectistyle' in $.data(this)){
				$.data(this, 'selectistyle')[method || 'enable']();
			}
		});
	},
	disable: function(){
		Selectistyle.enable.call(this, 'disable');
	},
	destroy: function(){
		this.each(function(){
			if('selectistyle' in $.data(this)){
				$.data(this, 'selectistyle').destroy();
				delete $.data(this).selectistyle;
			}
		});
	},
	reset: function(){
		this.each(function(){
			if('selectistyle' in $.data(this)){
				$.data(this, 'selectistyle').reset();
			}
		});
	}
});

$.fn.selectistyle = function(opts){
	var s = Selectistyle;
	
	if($(this).is('select')){
		if(typeof opts == 'string' && opts in s){
			s[opts].call(this);
		}else{
			s.init.call(this, opts);
		}
	}
	
	return this;
};
})(jQuery);