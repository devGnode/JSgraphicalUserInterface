//graphicalUserInterface
/*
*
* https://github.com/devGnode/JSgraphicalUserInterface
*
* @LUpdate 17/04/2017
* @VErsion 1.3
* @licence AGPL-3.0
*
work arrond to canvas object
setting
	{
	 monitor : handle canvas,
	 width: uint32,
	 height: uint32, 
	 
	 
	 
	 no facultif
	 rgba: true, default 0xFF	
	
	}
*/
var graphicalUserInterface = function( setting, _self ){
	
		var self = _self || {};
		var rawMonitor = setting.monitor,
		
		ctxMonitor = rawMonitor.getContext("2d"),
			
		screen_x   = setting.width  || rawMonitor.width,
		screen_y   = setting.height || rawMonitor.height,
		screen_d   = ctxMonitor.createImageData( screen_x, screen_y ),
		screen_len = screen_d.data.length;
			
		rawMonitor.width  = screen_x;
		rawMonitor.height = screen_y,
		bpp = setting.bpp || 4;
			
			
	["x","y"].map( function( val ){
		self["screen_"+val ] = val === "x" ? rawMonitor.width : rawMonitor.height;
 	});
	self.drawImage = function( imgNode ){
		ctxMonitor.drawImage( imgNode, 0,0 );
		screen_d = ctxMonitor.getImageData( 0,0, screen_x, screen_y );
	return this;
	};
	// reset Monitor
	self.resetScreen = function( color ){
		var h = 0;
		while( h <= screen_y ){
			this.setLine( h, (color != undefined ? color : 0xFFFFFF ) );
			h++;
		}
		this.refresh( );
	return this;
	};
	// resize Monitor
	self.resize = function( x, y ){
		rawMonitor.width  = this.screen_x = screen_x = x;
		rawMonitor.height = this.screen_y = screen_y = y;
		screen_d = ctxMonitor.createImageData( x, y );
	};
	["get","set"].map( function( val ){
		// get & set RawPixel
		// By offset
		self[ val+"RawPixel" ] = function( offset, color ){
			if( val == "set" ){
				
				screen_d.data[ offset+0x00 ] = ( color >> 0x10 )&0xff;	// R
				screen_d.data[ offset+0x01 ] = ( color >> 0x08 )&0xff;	// G
				screen_d.data[ offset+0x02 ] = ( color )&0xff;		// B
				screen_d.data[ offset+0x03 ] = setting.rgba ? ( color >> 0x18 )&0xff : 255; // A
				
			}else{
			return ( screen_d.data[ offset+0x00 ] << 0x10 |
				 screen_d.data[ offset+0x01 ] << 0x08 |
				 screen_d.data[ offset+0x02 ] | 
				(setting.rgba ? screen_d.data[ offset+0x03 ]  : 0 ) << 0x18 );
			}
		};
		// get & set Line
		self[ val+"Line" ] = function( y, color, returnColorInt ){
			var addr = ( y * screen_x *0x04 )+0,
				base = ( addr + screen_x * 0x04 ),
				colors = [], cnt = 0;
				
				if( color === undefined ){
					console.log( color );
					console.log( y );
					return;
				}
				
				try{
					while( addr < base ){
						val == "get" ? ( colors[ ( returnColorInt ? colors.length : addr/0x04 )] = self.getRawPixel( addr ) ) :
							typeof color == "function" ? 
							color.call( self, addr/0x04 ) : 
							self.setRawPixel( addr, typeof color == "number" ?
							color : 
							color[ returnColorInt ? (cnt++) : addr/0x04 ] );
						cnt++;
						addr+= 0x04;
					}
					
				}catch( e ){ 
				console.log(e);
				};
				
		return ( val == "get" ? colors : 1 );
		};
		// set & get Pixel
		// bY point destination x,y
		self[ val+"Pixel" ] = function( x, y, color ){
			// ( LineY * screen_x + offset ) * bpp 
			return self[ val+"RawPixel"].call( self, ( ( ( y * screen_x ) + x )*0x04 ), color );
		};
		// set & get Pixel
		// bY point destination x,y
		self[ val+"PixelOff" ] = function( offset, color ){
		return self[ val+"RawPixel"].call( self, offset*0x04, color );
		};
	});
	
	
	// @proc
	// @return void
	// browse each pixelDepth
	self.each = function( callback ){
		var tmp, offset = 0;
		try{
		for(; offset < (this.screen_x * this.screen_y)*4 ; offset+=4 )
		callback.call(
			( setting.buffer || this ),		// this
			offset/4,				// addr 
			( tmp = this.getRawPixel( offset ) ),	// int color
			this.intToRgb( tmp ),			// JSON{ rgb }
			parseInt( (offset/4)%this.screen_x ),  	// X position
			parseInt( (offset/4)/this.screen_x )  	// Y position
		);;
		
		}catch(e)
		{self.e=e;}
	return this;
	};
	/* 
	 # xa,ya == COORD XY 
	 # xb -1 == < ; +1 == >
	 # yb -1 == ^ ; +1 == v
	 # w	width
	 # h	height
	 # c	Color
	*/
	self.lines = function( xa, ya, xb, yb, w, h, c  ){
		var i=0;
		
		w=Math.abs(w);
		h=Math.abs(h);
		while( i < h  ){
		this.bind( 
			xa+(yb!=undefined?i:0),ya+(xb!=undefined?i:0),
			( xb != undefined ? xb > 0 ? xa+w : xa-w : xa )+(yb!=undefined?i:0),// x'
			( yb != undefined ? yb > 0 ? ya-w : ya+w : ya )+(xb!=undefined?i:0),// y'
			c
		);
			i++;
		}
	return this;
	};
	self.bindType = 0;
	self.bind = function( xa,ya, xb, yb, clr, OPTS ){
		var bs,m,i,l,c;
		// Y = a.( x - xa ) + ya 
		// m  Coeff director -- i  offset
		// bs base
		i  = Math.min(xa,xb);
		bs = Math.max(xa,xb);
		
		// size
		l=parseInt(Math.sqrt( Math.pow(xb-xa, 2 ) + Math.pow(yb-ya, 2) ))-(bs-i)

		
		// AXE X [ xa, xb ]
		if( (xb-xa) != 0 ){
			m= (yb-ya)/(xb-xa);
			while( i <= bs ){
				(c=parseInt( m*(i-xa)+ya )) > 0 && c <= this.screen_x &&
				i > 0 && i <= this.screen_x && ( !(OPTS&0x0f||this.bindType) || !(i%(OPTS&0x0F||this.bindType)) ) ?
				this.setPixel( i, Math.abs( c ), clr != undefined ? clr : 0xffffff )
				: void 0;
				i++;
			} 
		}
		// re-def coeff
		// AXE Y [ ya, yb ]
		i  = Math.min(ya,yb);
		bs = Math.max(ya,yb);
		m  = (xb-xa)/(yb-ya);
		if( l > 0 && (yb-ya) != 0  )
		while( i <= bs ){
		
			(c=parseInt( m*(i-ya)+xa )) > 0 && c <= this.screen_y &&
			i > 0 && i <= this.screen_y && ( !(OPTS&0x0f||this.bindType) || !(i%(OPTS&0x0F||this.bindType)) ) ?
			this.setPixel( Math.abs( c ), i, clr != undefined ? clr : 0xffffff )
			: void 0;
			i++;
		};
		m=bs=i=l=c=null;
	return this;
	};
	
	self.snapshot = function( ){
	return rawMonitor.toDataURL( );
	};
	// return * ptrData
	self.snapDat = function( t ){
		t=t||[];
		self.each(function( addr, uint32 ){
			t[addr]=uint32;
		});
	return t;
	};
	// refresh monitor
	self.refresh = function( ){
		ctxMonitor.putImageData( screen_d, 0,0 );
	return this;
	};
	
	// refresh monitor
	self.cerc = function( cx, cy, r ){
		
		var x= 0, y= r, m= 5-4*r;
		
		while( x <= y ){
			
			this.setPixel( x+cx, y+cy, 0x00ff00 );
			this.setPixel( y+cy, x+cx, 0x00ff00 );
			this.setPixel( cx-x, y+cy, 0x00ff00 );
			this.setPixel( cx-y, cy+x, 0x00ff00 );
			this.setPixel( x+cx, cy-y, 0x00ff00 );
			this.setPixel( cx+y, cy-x, 0x00ff00 );
			
			this.setPixel( cx-x, cy-y, 0x00ff00 );
			this.setPixel( cx-y, cy-x, 0x00ff00 );
			if( m > 0 )
			y--,m-=8*y;; 
			x++;
			m+=8*x+4;
		}
		
		this.refresh();
	return this;
	};
	var  k=0;
	self.test = function( x, y, a, r ){
		var i=0;
		var c =[0xff0000,0x00ff00,0x0000ff];
		this.bind( x,y ,parseInt( x+r*Math.cos( Math.PI*a/180 ) ), parseInt( y+r*Math.sin( Math.PI*a/180 ) ), c[k] );
		k = k+1>=3 ? 0 : k+1;
	/*	while( i <= 360 ){
			this.setPixel( parseInt( x+r*Math.cos( Math.PI*i/180 ) ), parseInt( y+r*Math.sin( Math.PI*i/180 ) ), 0x00ff00 );
			//this.setPixel( parseInt( x+r*Math.cos( Math.PI*i/180 ) ), parseInt( y+r*Math.sin( Math.PI*i/180 ) )-1, 0x0000ff );
			//a == i ?
			//this.bind( x,y ,parseInt( x+r*Math.cos( Math.PI*i/180 ) ), parseInt( y+r*Math.sin( Math.PI*i/180 ) ), 0xff0000) : void 0;
			this.bind( x,y ,parseInt( x+r*Math.cos( Math.PI*i/180 ) ), parseInt( y+r*Math.sin( Math.PI*i/180 ) ), 0xff0000);
			//this.bind( x,y ,parseInt( x+r*Math.cos( Math.PI*i/180 ) ), parseInt( y+r*Math.sin( Math.PI*i/180 ) )-1, 0x00ff00);
			//this.bind( x,y ,parseInt( x+r*Math.cos( Math.PI*i/180 ) ), parseInt( y+r*Math.sin( Math.PI*i/180 ) ), 0x0000ff);
			//console.log(  parseInt( x+r*Math.cos( Math.PI*i/180 ) ), "/ sin /",  parseInt( x+r*Math.sin( Math.PI*i/180 ) ), " /i/ ", i );
			i++;
		}*/
		
		this.refresh( );
	};
	self.rot = function( hprop, x, y ){
		var offsetX = x*1, // 1dot offset
			offsetY = y*1, // 1dot offset
			i =x=y=0,
			
			// rcos radiant cosinus
			// rsin radiant sinus
			rcos = Math.sin( Math.PI* hprop.angle /180 ),
			rsin = Math.cos( Math.PI* hprop.angle /180 ),
			// size of the new Image buffer
			// x' * y' 
			nX = parseInt( 
				hprop.x * Math.abs( rcos ) + hprop.y * Math.abs( rsin ) 
				),
			nY = parseInt( 
				hprop.x * Math.abs( rsin ) + hprop.y * Math.abs( rcos ) 
				),
			len = nX*nY;
			
			//pksl.val(nY+" // "+nX+" addr "+(( parseInt( i%nX ) + offsetX ) - ( nX/2 ))+"\r\n",1);
			try{
				// Browse new buffer	
				var img= new Array( len ).fill( 0 );
				for(; i < len; i++,x++ ){
					
					x = Math.floor(  
						( hprop.x/2)+( (( parseInt( i%nX )  )) - nX/2 ) * rcos - ( ( parseInt( i/nX ) )-(nY/2) ) * rsin 
						);
					y = Math.floor(  
						(hprop.y/2)+( (( parseInt( i%nX )  )) - nX/2 ) * rsin + ( ( parseInt( i/nX ) )-(nY/2) ) * rcos
					);
						
					// gui monitor canvas
					//
					x >= 0 && x < hprop.x && y >= 0 && y < hprop.y ?
					this.setPixel(
						parseInt( ( parseInt( i%nX ) + offsetX ) - ( nX/2 ) ), // use round or parsInt avoid float addr
						parseInt( ( parseInt( i/nX ) + offsetY ) - ( nY/2 ) ), // use round or parsInt avoid float addr
						hprop.__code[ ( y * hprop.x ) + x ]
					) : (hprop.overflow ? this.setPixel(
						parseInt( ( parseInt( i%nX ) + offsetX ) - ( nX/2 ) ),
						parseInt( ( parseInt( i/nX ) + offsetY ) - ( nY/2 ) ),
						hprop.overflow
					) : void 0);
				}
			//gui.refresh( );
			offsetX=offsetY=i=x=y=nX=nY=rcos=rsin=len=null;
			}catch(e){
			return !1;
			}
	return !0;		
	};
	//
	// v 1.3
	self.tiles = function( opts ){
	var _self = this;
	return {
		
		setTilesByOffset:function( offset, sprite, clr, bckg ){	
		return this.setTiles( 
				parseInt( offset% ( _self.screen_x / opts.offsetTilesX ) ),
				parseInt( offset/ ( _self.screen_x / opts.offsetTilesX ) ),
				sprite,
				clr,
				bckg
			);
		},
		setTiles:function( x, y, sprite, clr, bckg ){
			var offsetX = x * ( opts.offsetTilesX || 1 ),
				offsetY = y * ( opts.offsetTilesY || 1 ),
				// center opts
				cx = opts.center ? parseInt( opts.offsetTilesX/2  ) : 0,
				cy = opts.center ? parseInt( opts.offsetTilesY/2 )  : 0,
				len = sprite.length,
				i=0;
				//check
				offsetX /= opts.mod === 0 ? opts.offsetTilesX : 1;
				offsetY /= opts.mod === 0 ? opts.offsetTilesY : 1;
				
			try{
				for(; i < len; i++ ){
					_self.setRawPixel( 
						( ( ((( parseInt( i/ opts.offsetTilesX ) + offsetY ) - cy ) * _self.screen_x ) + ((parseInt( i% opts.offsetTilesX )- cx + offsetX ) ))*0x04 ),
						// himself
						!opts.mod || opts.mod === 0 ?
							sprite[ i ] :
						opts.mod === 1 ?
							opts.palette[ sprite[i] ] :
						// binary img
						opts.mod === 2 ?
							( sprite[ i ] === 1 ? opts.palette[ clr ] : 
							  sprite[ i ] === 0 && ( bckg || bckg >= 0 ) ? opts.palette[ bckg ] : _self.getRawPixel( i ) ) 
							  : void 0
					);
				}		
			}catch(e){
				//error 
				console.log(e);
				return false;
			}
		return ( opts.buffer ? opts.buffer : true );
		}
	};		
	};
	// convert int to RRGGBB
	var intToRgb = self.intToRgb = window.intToRgb = function( color ){
	return { r:(( color >> 0x10 )&0xff),
		 g:(( color >> 0x08 )&0xff),
		 b:( color&0xff) 
		};
	};
	
return self;
};
