/*!
 * test1.js - v1.0
 * KAKAOPAY TEST1 
 * 2018 배용주 (BAE, YONGJOO)
 * ilikempower@gmail.com
 * ie11~ , chrome, safari ...
*/

(function(global){
    /*****************************************
     * Aliases : 자주 사용하는 단축명을 정의합니다.
    ******************************************/
    var D=document,aC='appendChild',cE='createElement',dG='__defineGetter__',dS='__defineSetter__';
    /*****************************************
     * Array Extension : Array Object에  기능 추가
    ******************************************/
    if( !Array.hasOwnProperty('trim')) {
        Array.prototype.trim = function() {
            // 조건에 따라 값 삭제
            return this.filter(function(o,i,a){
                return !(o === undefined || o === null || o === '' || o.qty === 0);
            });
        };
    }
    /*****************************************
     * Polyfill
    ******************************************/
    try {
        var ce = new window.CustomEvent('test');
        ce.preventDefault();
        if (ce.defaultPrevented !== true) {
            throw new Error('Could not prevent default');
        }
    } catch(e) {
        // CustomEvent이 없는 브라우저를 위한 Polyfill 코드
        var CustomEvent = function(event, params) {
            var evt, origPrevent;
            params = params || {
            bubbles: false,
            cancelable: false,
            detail: undefined
            };

            evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            origPrevent = evt.preventDefault;
            evt.preventDefault = function () {
            origPrevent.call(this);
            try {
                Object.defineProperty(this, 'defaultPrevented', {
                get: function () {
                    return true;
                }
                });
            } catch(e) {
                this.defaultPrevented = true;
            }
            };
            return evt;
        };

        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent; // expose definition to window
    }

    /*****************************************
     * Element Extension : Element에 기능 추가
    ******************************************/
    Element.prototype.addClass = function(name){
        var self = this;
        var names = name.replace(/ /gi,',').split(',');
        names.map(function(d){
            if(!self.classList.contains(d)){
                self.classList.add(d);
            }
        });
        return self;
    };
    Element.prototype.removeClass = function(name){
        var self = this;
        var names = name.replace(/ /gi,',').split(',');
        names.map(function(d){
            if(self.classList.contains(d)){
                self.classList.remove(d);
            }
        });
        if(self.classList.length == 0){
            self.removeAttribute('class');
        }
        return self;
    };
    Element.prototype.hasClass = function(name){
        return this.classList.contains(name);
    };
    if (!Element.prototype.remove) {
        Element.prototype.remove = function remove() {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        };
    }
    if(!Element.prototype.trigger){
        Element.prototype.trigger = function(name, detail){
            var self = this;
            var names = name.replace(/ /gi,',').split(',');
            if(typeof detail == 'undefined'){
                names.map(function(d){
                    var evt = new CustomEvent(d);
                    self.dispatchEvent(evt);
                });
            }
            else {
                names.map(function(d){
                    var evt = new CustomEvent(d, detail);
                    self.dispatchEvent(evt);
                });        
            }
            return self;
        }
    }

    /*****************************************
     * Layout Object
    ******************************************/
    var layouts = function() {
        // 매도 그룹, 매수그룹, 거래체결 로그그룹
        this.salegroup;
        this.buygroup;
        this.loggroup;
    };
    layouts.prototype.initialize = function(parent){
        // 화면 레이아웃을 구성합니다. 호가창, 거래체결 로그창
        var container = D[cE]('main');
        var chartWrap = D[cE]('div');
        chartWrap.addClass('chart')
        var monitor = D[cE]('div');
        monitor.addClass('monitor');
        var dataWrap = D[cE]('div');
        dataWrap.addClass('call');
        var logWrap = D[cE]('div');
        logWrap.addClass('trans');
        var headerBar = D[cE]('div');
        headerBar.addClass('data-header call');
        var salesHeader = D[cE]('span');
        var salesQty = D[cE]('p');
        var salesPrice = D[cE]('p');
        salesQty.innerText = '매도수량';
        salesPrice.innerText = '매도가격';
        salesHeader[aC](salesQty);
        salesHeader[aC](salesPrice);        
        var buyHeader = D[cE]('span');
        var buyPrice = D[cE]('p');
        var buyQty = D[cE]('p');
        buyPrice.innerText = '매수가격';
        buyQty.innerText = '매수수량';
        buyHeader[aC](buyPrice);
        buyHeader[aC](buyQty);
        headerBar[aC](salesHeader);
        headerBar[aC](buyHeader);
        var inputdataWrap = D[cE]('div');
        inputdataWrap.addClass('data-list');

        this.salegroup = D[cE]('ul');
        this.salegroup.addClass('sale');
        this.buygroup = D[cE]('ul');
        this.buygroup.addClass('buy');

        var logBar = D[cE]('div');
        logBar.addClass('data-header');
        var logHeader = D[cE]('span');
        logHeader.style.setProperty('width','100%');
        logHeader.innerText = '체결정보';
        logBar[aC](logHeader);
        var logdataWrap = D[cE]('div');
        logdataWrap.addClass('data-list');
        this.loggroup = D[cE]('ul');

        inputdataWrap[aC](this.salegroup);
        inputdataWrap[aC](this.buygroup);
        dataWrap[aC](headerBar);
        dataWrap[aC](inputdataWrap);
        monitor[aC](dataWrap);
        logdataWrap[aC](this.loggroup);
        logWrap[aC](logBar);
        logWrap[aC](logdataWrap);
        monitor[aC](logWrap);

        container[aC](chartWrap);
        container[aC](monitor);

        document.body[aC](container);
    };
    /*****************************************
     * Component Object
    ******************************************/
    var components = function() {
    };
    components.prototype.initialize = function() {
        this.createChart();
    };
    components.prototype.createItem = function(d){
        // INPUT DATA UI Component
        var self = this;
        var data = self.data;
        var id = (new Date()).getTime();
        var item = D[cE]('li');
        var sale = D[cE]('span');
        var buy = D[cE]('span');
        var price = D[cE]('p');
        var qty = D[cE]('p');
        // 거래 처리를 위한 function
        var sale_calc = self.sale_calc;
        var buy_calc = self.buy_calc;

        item.id = id;

        item[aC](sale);
        item[aC](buy);

        item[dG]('index',function(){return d.no;});
        item[dG]('price',function(){return d.price;});
        item[dG]('qty',function(){return d.qty;});
        item[dS]('price',function(v){price.innerText = v;});
        item[dS]('qty',function(v){
            if(d.qty != v){
                // 수량값이 변경될 경우 값을 적용하고 update이벤트를 트리거
                qty.innerText = d.qty = v;
                item.trigger('update');
            }
            return v;
        });
        item.setAttribute('no',d.no);
        price.innerText = d.price;
        qty.innerText = d.qty;

        item.pid = null;
        item.addEventListener('update',function(e){
            // update 상태를 표시하기 위하여 update Class추가, 수량이 0일 경우 remove Class추가
            item.addClass('update');
            if(item.qty == 0){item.addClass('remove');}
            if(item.pid != null) {clearTimeout(item.pid);}
            item.pid = setTimeout(function(){
                // 200ms 뒤에 update Class제거, 수량이 0일 경우 컴포넌트 제거 
                item.removeClass('update');
                if(item.qty == 0){
                    item.remove();
                }
            },200);
        });
        if(d.type == 'S') {
            // 매수그룹에 추가
            sale[aC](qty);
            sale[aC](price);
            item.addEventListener('sale',function(e){
                if(e.preventDefault) e.preventDefault();
                if(e.stopPropagation) e.stopPropagation();
                sale_calc.call(self,d,item);
            });
        }
        else {
            // 매도그룹에 추가
            buy[aC](price);
            buy[aC](qty);
            item.addEventListener('buy',function(e){
                if(e.preventDefault) e.preventDefault();
                if(e.stopPropagation) e.stopPropagation();
                buy_calc.call(self,d,item);
            });
        }
        return item;
    };
    components.prototype.createTransaction = function(d){
        // 거래체결 로그 UI 컴포넌트 
        var qty = d.qty;
        var trans = D[cE]('li');
        var basic = D[cE]('div');
        var sec = D[cE]('span');
        var log = D[cE]('span');
        var detail = D[cE]('div');
        sec.innerText = d.no + '초';
        log.innerText = (d.type == 'B'? '매수':'매도') + ': 가격 ' + d.price + ' / 수량 ' + qty;
        trans[dS]('result',function(v){
            log.innerText += ' ( 체결: ' + (qty - v) + ')';
        });
        trans[dS]('log',function(v){
            if(detail.innerText != ''){detail[aC](D[cE]('br'));}
            detail[aC](D.createTextNode('  - ' + (v.type=='B'? '매수':'매도') +': 가격 ' + (v.price) + '/수량 '+ v.qty))            
        });
        basic[aC](sec);
        basic[aC](log);
        trans[aC](basic);
        trans[aC](detail);
        return trans;
    }
    components.prototype.createChart = function(){
        var data = this.data;
        var margin = {top: 8, 
            right: 8, 
            bottom: 28, 
            left: 8},
        width = Math.round(document.documentElement.clientWidth),
        height = Math.round(document.documentElement.clientHeight*0.2);
        var w = width - margin.left - margin.right,
        h = height - margin.top - margin.bottom;
        var chart = D.querySelector('.chart');
        var svg = d3.select(chart).append('svg')
        .attr('width',width)
        .attr('height', height);
        var xscale = d3.scaleLinear()
        .domain([1, 59])
        .range([margin.left, w]);
        var yscale = d3.scaleLinear()
        .domain([0,0])
        .range([h, margin.top]);
        var yAxis = d3.axisRight(yscale)
        .ticks(2);
        var xAxis = d3.axisBottom(xscale)
        .ticks(10);
        var line = d3.line()
        .x(function(d) { return xscale(d.x); })
        .y(function(d) { return yscale(d.y); }); 

        svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
        .call(yAxis);

        svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (h + margin.top) + ")")
        .call(xAxis);

        var g = svg.append("g").attr("transform", "translate(0," + margin.top + ")");
        g.append("path");

        chart.addEventListener('update',function(e){
            var max_y = d3.max(data.c_data.map(function(d){return d.y;}));
            yscale = d3.scaleLinear()
            .domain([0,max_y])
            .range([h, margin.top])
            .nice();
            yAxis = d3.axisRight(yscale)
            .ticks(2);
            svg.selectAll('.y-axis')
            //.attr("transform", "translate(-" + w-margin.left + "," + margin.top + ")")
            .transition()
            .call(yAxis);
            line = d3.line()
            .x(function(d) { return xscale(d.x); })
            .y(function(d) { return yscale(d.y); }); 

            g.selectAll("path")
            .datum(data.c_data).transition()
            .attr("class",function(d,i){return "path d-" + i;})
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line)

            g.selectAll(".qty").attr("style","opacity:0;transition: 100ms linear")
            .data(data.c_data)
            .attr("transform", function(d){return 'translate(' + (xscale(d.x) - 14) + ',' + (yscale(d.y) - 8) + ')';})
            .attr("dx", ".71em")
            .attr("dy", ".35em")
            .attr("style",function(d){return d.y==0? 'opacity:0;transition: 100ms linear':'opacity:1;font-size:12px;transition: all 800ms cubic-bezier(0.9, 0.85, 0.05, 0.01);';})
            .enter()
            .append('text')
            .attr("class", "qty")
            .attr("transform", function(d){return 'translate(' + (xscale(d.x) - 14) + ',' + (yscale(d.y) - 8) + ')';})
            .attr("dx", ".71em")
            .attr("dy", ".35em")
            .attr("style",function(d){return d.y==0? 'opacity:0;transition: 100ms linear':'opacity:1;font-size:12px;transition: all 800ms cubic-bezier(0.9, 0.85, 0.05, 0.01);';})
            
            .text(function(d) { return d.y;});
        });
        return chart;
    }
    /*****************************************
     * Model Object
    ******************************************/
    var model = function(){
        this.layouts, this.components,
        // 매수, 메도 데이터
        this.data = {
            b_data: [],
            s_data: [],
            c_data: []
        },
        this.socket = null;
    };
    model.prototype.initialize = function(){
        var self = this;
        var layouts = self.layouts;
        // WebSocket 또는 Long-polling
        self.socket = io(); 
        self.socket.on('data',function(d){
            if(typeof d != 'undefined' && typeof d.type != 'undefined'){
                if(d.no == 1){
                    var x;
                    for(x = layouts.salegroup.childElementCount-1; x > -1 ; x--){
                        layouts.salegroup.childNodes[x].remove();
                    };
                    for(x = layouts.buygroup.childElementCount-1; x > -1 ; x--){
                        layouts.buygroup.childNodes[x].remove();
                    };
                    for(x = layouts.loggroup.childElementCount-1; x > -1 ; x--){
                        layouts.loggroup.childNodes[x].remove();
                    };
                    self.data.b_data = [];
                    self.data.s_data = [];
                    self.data.c_data = [];
                }
                self.createItem(d);
            }
         });
    };
    model.prototype.createItem = function(d){
        // 입력된 값을 화면에 표시하고, 매수 또는 매도를 위한 이벤트 트리커
        var cmd = d.type == 'B'? 'buy':'sale';
        var layouts = this.layouts;
        var components = this.components;
        var data = this.data;
        var item = components.createItem(d);

        d.id = item.id;

        data[d.type.toLowerCase() + '_data'].push(d);
        layouts[cmd + 'group'][aC](item);
        item.trigger(cmd);
    }
    model.prototype.buy = function(d,item){
        // 메수 처리
        var data = this.data;
        var l_d = JSON.parse(JSON.stringify(d));
        var l_detail = [];
        
        var d1 = this.data.s_data.filter(function(v){
            // 매도 데이터에서 매수 조건에 맞는 데이터 반환
            return (v.price <= d.price) && v.qty != 0;
        });
        if(d1.length>0){
            // 가격 및 수량을 기준으로 정렬(낮은가격)
            d1.sort(function(a,b){ if(a.price == b.price) { return b.qty - a.qty; } else return a.price - b.price});
            for(var i =0; i < d1.length;i++){
                if(d.qty > 0) {
                    var o = document.getElementById(d1[i].id);
                    l_detail.push(JSON.parse(JSON.stringify(d1[i])));
                    if(o.qty > d.qty) {
                        o.qty = o.qty - d.qty;
                        item.qty = 0;
                    }
                    else {
                        item.qty = item.qty - o.qty;
                        o.qty = 0;
                    }
                }
                else {
                    break;
                }
            }
            // 수량이 0인 값을 제거
            data.s_data = data.s_data.trim();
            data.b_data = data.b_data.trim();
            // 거래체결 로그 
            // Chart Data
            data.c_data.push({"x":d.no,"y":(l_d.qty - item.qty)});
            var trans = this.createTransaction(l_d);
            l_detail.forEach(function(d2){
                trans.log = d2;
            });
            this.layouts.loggroup[aC](trans);
            trans.result = item.qty;
        }
        else {
            data.c_data.push({"x":d.no,"y":0});
        }
        var chart = document.querySelector('div.chart');
        chart.trigger('update');
    }
    model.prototype.sale = function(d,item){
        // 매도 처리
        var data = this.data;
        var l_d = JSON.parse(JSON.stringify(d));
        var l_detail = [];
        var d1 = this.data.b_data.filter(function(v){
            // 매수 데이터에서 매도 조건에 맞는 데이터 반환
            return (v.price >= d.price) && v.qty > 0;
        });
        if(d1.length>0){
            // 가격 및 수량을 기준으로 정렬(높은가격)
            d1.sort(function(a,b){ if(a.price == b.price) { return b.qty - a.qty; } else return b.price - a.price});
            for(var i =0; i < d1.length;i++){
                if(d.qty > 0) {
                    var o = document.getElementById(d1[i].id);
                    l_detail.push(JSON.parse(JSON.stringify(d1[i])));
                    if(o.qty > d.qty) {
                        o.qty = o.qty - d.qty;
                        item.qty = 0;
                    }
                    else {
                        item.qty = item.qty - o.qty;
                        o.qty = 0;
                    }
                }
                else {
                    break;
                }
            }
            // 수량이 0인 값을 제거
            data.b_data = data.b_data.trim();
            data.s_data = data.s_data.trim();
            // 거래체결 로그 
            // Chart Data
            data.c_data.push({"x":d.no,"y":(l_d.qty - item.qty)});
            var trans = this.createTransaction(l_d);
            l_detail.forEach(function(d2){
                trans.log = d2;
            });
            this.layouts.loggroup[aC](trans);
            trans.result = item.qty;

        }
        else {
            data.c_data.push({"x":d.no,"y":0});
        }
        var chart = document.querySelector('div.chart');
        chart.trigger('update');
    }
    /*****************************************
     * Core 1.0 TEST1
    ******************************************/
    var core = function(){
        this.construct = {
            "name":"core",
            "version":"1.0"
        }
        this.layouts = new layouts();
        this.components = new components();
        this.model = new model();

        this.layouts.data = this.model.data;
        this.components.data = this.model.data;
        this.components.layouts = this.layouts;
        this.components.sale_calc = this.model.sale;
        this.components.buy_calc = this.model.buy;
        this.model.layouts = this.layouts;
        this.model.components = this.components;
    };
    core.prototype.initialize = function(){
        this.layouts.initialize();
        this.components.initialize();
        this.model.initialize();
    };
    
    var test1 = new core();
    global.addEventListener("load",function(e){
        test1.initialize();
    })
})(window)