;(function($){
var $doc,
	counter = 0,
	instance = {},
	Selectistyle = function(){};

Selectistyle.prototype = {
	init: function($sel, st){
		this.$sel = $sel;
		this.st = st;
		this.cls = 'ssd-active';
		this.dCls = this.st.prefix + '-disabled';
		this.focusCls = 'ssd-focus';
		this.$hilited = [];
		this.to = null;
		
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
		
		var html = '<div id="' + ids.aId + '" class="' + cls + 'hotspot" tabindex="' + elem.tabIndex + '">\n'
			+ '<span class="' + cls + 'arrow"></span>\n'
			+ '<span class="' + cls + 'text">' + opts[sIdx].text + '</span>\n'
			+ '</div>\n'
			+ '<div id="' + ids.divId + '" class="' + cls + 'div" style="display:none;">\n'
			+ '<ul id="' + ids.ulId + '" class="' + cls + 'ul">\n';
		
		for(var i=0; opts[i]; i++){
			html += '<li class="' + cls + 'li' + (i === sIdx ? ' ssa-active' : '') + '">'
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
		this.$a  = $('#' + this.ids.aId);
		this.$dd = $('#' + this.ids.divId);
		this.$textbox = this.$a.find('span.' + this.st.prefix + '-text');

		this.$a.bind({
			click: $.proxy(this.handleClick, this),
			focus: $.proxy(this.handleClick, this),
			blur: $.proxy(this.hideDropDown, this),
			keydown: $.proxy(this.handleKeys, this)
		});
		
		this.$dd.bind('click', $.proxy(this.handleDropdown, this));
	},
	handleKeys: function(e){
		switch(e.keyCode){
			// up key
			case 38:
				this.handleArrowKey(-1);
				break;
			// down key
			case 40:
				this.handleArrowKey(1);
				break;
			// enter key
			case 13:
				this.handleEnterKey();
				break;
		}
	},
	handleArrowKey: function(delta){
		var $dd = this.$dd,
			$current = this.$hilited,
			$adjacent = [];
		
		if($current.length){
			$adjacent = delta > 0 ? $current.next() : $current.prev();
			$current.removeClass(this.focusCls);
		}
		
		if(!$adjacent.length){
			$adjacent = delta > 0 ? $dd.find('li:first-child') : $dd.find('li:last-child');
		}
		
		$adjacent.addClass(this.focusCls);
		this.$hilited = $adjacent;
	},
	handleEnterKey: function(){
		var $current = this.$hilited;
		
		if($current.length){
			$current.find('a').trigger('click');
		}
		
		this.$a.blur();
	},
	hideDropDown: function(e){
		if(!e){$doc.unbind('click', this.handleDocClick);}
		this.$dd[this.st.offEffect](this.st.speed).removeClass(this.cls);
	},
	handleDocClick: function(){
		console.log('exec');
		this.hideDropDown();
	},
	handleClick: function(e){
		var self = this,
			$this = $(e.target),
			cls = this.cls,
			$dd = this.$dd;
			
		clearTimeout(this.to);
		
		this.to = setTimeout(function(){
			if($dd.hasClass(cls)){
				self.hideDropDown();
			}else{
				$dd[self.st.onEffect](self.st.speed).addClass(cls);
				
				if(e.type == 'click'){
					if(!$doc){$doc = $(document);}
					$doc.bind('click', $.proxy(self.handleDocClick, self));
				}
			}
		}, 200);
		
		if(e.type == 'click'){e.stopPropagation();}
	},
	handleDropdown: function(e){
		var $tget = $(e.target),
			$sel = this.$sel,
			$a = this.$a,
			$li, txt, idx, cls = 'ssa-active';
		
		if($tget.closest('a').length){
			$tget = $tget.closest('a');
			$li = $tget.parent();
			
			if($li.hasClass(cls)){return;}
			
			this.$current.removeClass(cls);
			$li.addClass(cls);
			this.$current = $li;
			
			if(this.$hilited.length){
				this.$hilited.removeClass(this.focusCls);
				this.$hilited = [];
			}
			
			idx = $li.index();
			txt = $tget.text();
			
			this.$textbox.text(txt);
			$sel[0].selectedIndex = idx;
			
			$sel.change();
			
			if(this.st.callback && typeof this.st.callback == 'function'){
				this.st.callback.call($sel[0], $sel[0].value, txt);
			}
		}
	},
	enable: function(){
		this.$sel[0].disabled = false;
		this.$a[0].tabIndex = this.$sel[0].tabIndex;
		this.$a.bind('focus', $.proxy(this.handleClick, this));
		this.$a.parent().removeClass(this.dCls);
	},
	disable: function(){
		this.$sel[0].disabled = true;
		this.$a[0].tabIndex = -1;
		this.$a.unbind('focus', this.handleClick);
		this.$a.parent().addClass(this.dCls);
	},
	destroy: function(){
		var $parent = this.$a.parent();
		
		$parent
			.before(this.$sel)
			.remove();
			
		this.$sel.show();
	}
};

$.extend(Selectistyle, {
	init: function(opts){
		var $this,
			id,
			st = {
				prefix: 'selectistyle',
				onEffect: 'fadeIn',
				offEffect: 'fadeOut',
				speed: 'medium',
				widthAdj: 0,
				callback: null
			};
		
		$.extend(st, opts || {});
    
		this.each(function(){
			$this = $(this);
			
			if($this.is('select')){
				if('selectistyleid' in $.data(this)){return;}
				
				id = this.id ? this.id : this.id = 'selectid_' + counter;
				instance[id] = new Selectistyle;
				instance[id].init($this, st);
				
				$.data(this, 'selectistyleid', counter++);
			}
		});	
	},
	enable: function(method){
		this.each(function(){
			if(this.id in instance){
				instance[this.id][method || 'enable']();
			}
		});
	},
	disable: function(){
		Selectistyle.enable.call(this, 'disable');
	},
	enableOrDisable: function(method){
		this.each(function(){
			instance[this.id][method]();
		});
	},
	destroy: function(){
		this.each(function(){
			if('selectistyleid' in $.data(this)){
				delete $.data(this).selectistyleid;
				instance[this.id].destroy();
			}
		});
	}
});

$.fn.selectistyle = function(opts){
	if(typeof opts == 'string' && opts in Selectistyle){
		Selectistyle[opts].call(this);
	}else{
		Selectistyle.init.call(this, opts);
	}
	
	return this;
};
})(jQuery);