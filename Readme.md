#graphicalUserInterface

```javascript
  var opts;
  var guid = graphicalUserInterface( opts = {
    monitor: DOMHtml canvas,
    width: uint x,
    height: uint y,
    rgba: bool useRGBA
    });
```
**Global :**

>###uint screen_x 
>###uint screen_y

**methods :**

## .drawImage

parameters : DOMImage node
<br>@return void

  ```javascript
  guid.drawImage( imgNode );
```
  
### .resetScreen 

parameters : int color || str color
<br>@return void

```javascript
  guid.resetScreen( 0 );
```

### .resize 

parameters : uint x, uint y
<br>@return void

 ```javascript
  guid.resize( 320, 400 );
```

>###getRawPixel

parameters : uint offset
<br>@return **uint** colorRGB

```javascript
  guid.getRawPixel( 256 );
``` 
### .setRawPixel

parameters : uint offset, uint color
<br>@return void

```javascript
  guid.setRawPixel( 255, 16777215 );
```
### .getPixel

parameters : uint x, uint y
<br>@return **uint** colorRGB

```javascript
  guid.getPixel( 1, 0 );
```

### .setPixel

parameters : uint x, uint y, uint color
<br>@return void

```javascript
  guid.setPixel( 1, 0, 16711680 ); // #ff0000 -> red -> 1671168
  ```

>
### .getLine

parameters : uint y (, bool key  )
<br>@return Array ret[ addr1, addr2,... ] if key is false
<br>@return Array ret[ 1,2,3,.... ] if key is true

```javascript
  var line = guid.getLine( 1 );
      line[ y*screen_x ];
      line[ y*screen_x +1 ];
  var line = guid.getLine( 1, true );
      line[ 0 ];
      line[ 1 ];
```

### .setLine

parameters : uint y ,[ Array [0,1,2], bool key=true || Array[ offset, offset ] || uintcolor ][, bool key ]
<br>@return void

```javascript
  guid.setLine( 1, 255 );
  guid.setLine( 2, [ scree_x*y => 16777215, screen_x*y+1 =>255 ,...] );
  guid.setLine( 2, [ 0 => 16777215, 1 =>255 ,...], true );
```

### .refresh

parameters : void
@return void

```javascript
  guid.refresh( );
```
### .snapshot

parameters : void
<br>@return void

```javascript
  guid.snapshot( ); // dataURL
  ```
 
 ### .each

parameters : callback
<br>@return void

```javascript
  guid.each( function( addr, colorUint32, JSON rgb, uint32 x, uint32 y ){
    
    this == guid or buffer if opts.buffer is declared
  
  }); 
  ```
 ### Object tiles 
 ### .setTiles
 ### .setTilesByOffset
    
    JSON opts {
    mod:0 or 1 or 2
    
    mod:0,
    center: 1 or 0 
    // 
    mod:1
    palette: Array PaletteColor[...,...]
    
    
    //
    buffer: Array[]
    
 }

parameters : callback
<br>@return void

```javascript
  var tile = [
  0, 0xfefefe, 0xfafafa, 0xffffff ... // color data 
  ...
  ];
  // mod 0
  // 8*8
var mtile= guid.tiles({ 
    mod:0,
    offsetTilesX: 8,
    offsetTileY: 8,
    
  }).setTiles( screen_x, screen_y, tile );
```

<img src="http://www.zupimages.net/up/17/16/xk0f.png">

```javascript
var mtile= guid.tiles({ 
    mod:0,
    offsetTilesX: 8,
    offsetTileY: 8,
    
    center: true,
    
  }).setTilesByOffset(  5, tile );
```

<img src="http://www.zupimages.net/up/17/16/ne4c.png">

```javascript
  // mod 1
  // 8*8
 var tile = [
  0,3,3,2
  0,2,2,1
  ...
  ];
guid.tiles({ 
    mod:1,
    offsetTilesX: 8,
    offsetTilesY:8
    palette:[
       0, 0xfefefe, 0xfafafa, 0xffffff ... // color data 
    ],
    
  })( screen_x, screen_y, tile )
  
  // mod 2
  // 9*8
 var tile = [
  0,0,0,0,0,0,0,0,
  0,0,0,1,1,0,0,0,
  0,0,0,1,1,0,0,0,
  0,0,0,1,1,0,0,0,
  0,1,1,1,1,1,1,0,
  0,0,1,1,1,1,0,0,
  0,0,0,1,1,0,0,0,
  0,0,0,0,0,0,0,0,
  0,0,0,0,0,0,0,0,
  ...
  ];
guid.tiles({ 
    mod:1,
    offsetTilesX: 8,
    offsetTiesY:9,
    palette:[
       0, 0xfefefe, 0xfafafa, 0xffffff ... // color data 
    ],
    
  })( screen_x, screen_y, tile, 1 color font 0xfefefe , 0 background || null  )
  ```
  
  
  
  
>###intToRgb

parameters : uint color
<br>@return JSON { r: uint, g: uint g, b: uint b } 

```javascript
  var color = guid.rgb( 16777215 );
      color.r // 255
      color.g // 255
      color.b // 255
```
