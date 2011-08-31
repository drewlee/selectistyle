(function($){
$.fn.selectistyle = function(opts){
    var $doc = $(document),
        instance = {},
        st = {
            prefix: 'selectistyle',
            onEffect: 'fadeIn',
            offEffect: 'fadeOut',
            speed: 'medium',
            widthAdj: 0,
            callback: null
        };
    
    function Selectistyle($sel){
        var cls = 'ssd-active',
            _this = this;
        
        this.$sel = $sel;
        
        this.generateIds = function(){
            var id = this.$sel[0].id,
                cls = st.prefix + '_',
                ids = {
                    sId: id,
                    cId: cls + 'container_' + id,
                    aId: cls+ 'a_' + id,
                    divId: cls + 'div_' + id,
                    ulId: cls + 'ul_' + id
                };

            this.ids = ids;
        };
        
        this.generateHtml = function(){
            var elem = this.$sel[0],
                ids = this.ids,
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
            
            this.html = html;
        };
        
        this.insertSrc = function(){
            var $sel = this.$sel,
                wdth = $sel.outerWidth() + st.widthAdj;
            
            $sel.hide()
                .wrap('<div id="' + this.ids.cId + '" class="' + st.prefix + '-container" style="width:' + wdth + 'px;" />')
                .parent()
                .append(this.html);
        };
        
        this.hideDropDown = function(){
            _this.$dd[st.offEffect](st.speed).removeClass(cls);
            $doc.unbind('click', _this.handleDocClick);
        };
        
        this.handleDocClick = function(){
            _this.hideDropDown();
        };
        
        this.handleClick = function(e){
            var $this = $(this),
                $dd = _this.$dd;

            if($dd.hasClass(cls)){
                _this.hideDropDown();
            }else{
                $dd[st.onEffect](st.speed).addClass(cls);
                $doc.bind('click', _this.handleDocClick);
            }
            
            e.stopPropagation();
        };
        
        this.handleDropdown = function(e){
            var $tget = $(e.target),
                $sel = _this.$sel,
                $a = _this.$a,
                $li, txt, idx, cls = 'ssa-active';
            
            if($tget.closest('a').length){
                $tget = $tget.closest('a');
                $li = $tget.parent();
                
                if($li.hasClass(cls)){return;}
                
                $li.siblings('li.' + cls).removeClass(cls);
                $li.addClass(cls);
                
                idx = $li.index();
                txt = $tget.text();
                
                $a.find('span.' + st.prefix + '-text').text(txt);
                $sel[0].selectedIndex = idx;
                
                $sel.change();
                
                if(st.callback){
                    st.callback.call($sel[0], $sel[0].value, txt);
                }
            }
        };
        
        this.bindEvents = function(){
            var type = 'click.selectistyle';
            
            this.$a = $('#' + this.ids.aId);
            this.$dd = $('#' + this.ids.divId);

            this.$a.bind(type, this.handleClick);
            this.$dd.bind(type, this.handleDropdown);
        };
        
        this.generateIds();
        this.generateHtml();
        this.insertSrc();
        this.bindEvents();
		$.data($sel[0], 'selectistyled', true);
    }
    
    $.extend(st, opts || {});
    
    return this.each(function(){
        var $this = $(this), id;
        
        if($this.is('select')){
            id = this.id || 'select_' + Date.parse(new Date());
            if(!this.id){this.id = id;}
            instance[id] = new Selectistyle($this);
        }
    });
};
})(jQuery);