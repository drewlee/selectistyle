(function($){

$.fn.selectistyle = function(opts){
    var st = {
        prefix: 'selectistyle',
        onEffect: 'fadeIn',
        offEffect: 'fadeOut',
        speed: 'medium',
        widthAdj: 0,
        callback: null
    };
    
    var _methods = {
        init: function(elem){
            this.$sel = $(elem);
            this.$doc = $(document);
            
            var wdth = this.$sel.outerWidth() + st.widthAdj;
            var ids = this.generateIds();
            
            elem.style.display = 'none';
            
            this.insertSrc(this.generateHtml(ids), wdth, ids.cId);
            this.bindEvents(ids.aId, ids.divId);
        },
        
        generateIds: function(){
            var id = this.$sel[0].id || 'select_' + Date.parse(new Date()),
                cls = st.prefix + '_',
                ids = {
                    cId: cls + 'container_' + id,
                    aId: cls+ 'a_' + id,
                    divId: cls + 'div_' + id,
                    ulId: cls + 'ul_' + id
                };

            return ids;
        },
        
        generateHtml: function(ids){
            var elem = this.$sel[0],
                cls = st.prefix + '-',
                sIdx = elem.selectedIndex,
                opts = elem.options;
            
            var html = '<a id="' + ids.aId + '" class="' + cls + 'hotspot">\n'
                    + '<span class="' + cls + 'arrow"></span>\n'
                    + '<span class="' + cls + 'text">' + opts[sIdx].text + '</span>\n'
                + '</a>\n'
                + '<div id="' + ids.divId + '" class="' + cls + 'div" style="display:none;">\n'
                    + '<ul id="' + ids.ulId + '" class="' + cls + 'ul">\n';
            
            for(var i=0; opts[i]; i++){
                html += '<li class="' + cls + 'li' + (i === sIdx ? ' ssa-active' : '') + '">'
                        + '<a class="' + cls + 'a">' + opts[i].text + '</a>'
                    + '</li>\n';
            }
            
            html += '</ul>\n</div>\n';
            
            return html;
        },
        
        insertSrc: function(html, wdth, cId){
            this.$sel.wrap('<div id="' + cId + '" class="' + st.prefix + '-container" style="width:' + wdth + 'px;" />')
                .parent()
                .append(html);
        },
        
        bindEvents: function(aId, divId){
            this.$dd = $('#' + divId);
            this.$a = $('#' + aId);
            
            this.$a.bind('click.' + 'selectistyle', this.evts.handleClick);
            this.$dd.bind('click.' + 'selectistyle', this.evts.handleDropdown);
        },
        
        evts: {
            cls: 'ssd-active',
            
            hideDropDown: function(){
                var _this = _methods;
                
                _this.$dd[st.offEffect](st.speed).removeClass(_this.evts.cls);
                _this.$doc.unbind('click', _this.evts.handleDocClick);
            },
            
            handleDocClick: function(){
                _methods.evts.hideDropDown();
            },
            
            handleClick: function(e){
                var $this = $(this),
                    _this = _methods,
                    $dd = _this.$dd;
                
                if($dd.hasClass(_this.evts.cls)){
                    _this.evts.hideDropDown();
                }else{
                    $dd[st.onEffect](st.speed).addClass(_this.evts.cls);
                    _this.$doc.click(_this.evts.handleDocClick);
                }
                
                e.stopPropagation();
            },
            
            handleDropdown: function(e){
                var _this = _methods,
                    $tget = $(e.target),
                    sel = _this.$sel[0],
                    $li, txt, idx, cls = 'ssa-active';
                
                if($tget.closest('a').length){
                    $tget = $tget.closest('a');
                    $li = $tget.parent();
                    
                    if($li.hasClass(cls)){return;}
                    
                    $li.siblings('li.' + cls).removeClass(cls);
                    $li.addClass(cls);
                    
                    idx = $li.index();
                    txt = $tget.text();
                    
                    _this.$a.find('span.' + st.prefix + '-text').text(txt);
                    sel.selectedIndex = idx;
                    
                    _this.$sel.change();
                    
                    if(st.callback){
                        st.callback.call(sel, sel.value, txt);
                    }
                }
            }
        }
    };
    
    $.extend(st, opts || {});
    
    return this.each(function(){
        var $this = $(this);
        
        if(!$this.is('select')){return;}

        _methods.init(this);
    });
    
};

})(jQuery);