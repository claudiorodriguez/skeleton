function moveSkeletonToTile(skeleton_id, x, y) {
    var skeleton = $('#map [data-skeleton='+skeleton_id+']');
    var from_tile = skeleton.parents('[data-tile]');
    var to_tile = $('[data-tile][data-x='+x+'][data-y='+y+']');
    if (skeleton.length > 0 && from_tile.length > 0 && to_tile.length > 0 && !to_tile.attr('data-blocking')) {
        skeleton.detach().appendTo(to_tile);
        updateCounts();
        updateDropShadows();
    }
}

function updateCounts() {
    $('#map [data-skeleton],#map .count').parents('[data-tile]').each(function(){
        var el = $(this);
        var cnt = el.find('[data-skeleton]').length;
        el.find('.count').remove();
        if (cnt > 1) el.append($('<div>').attr('class','count').html(cnt));
    });
}
function updateDropShadows() {
    $('#map .dropshadow').remove();
    $('#map .character').before($('<div>').attr('class','decal dropshadow'));
}
function updateRoomWidth() {
    $('#room')
        .css('width', ($('#skeletons').width() + $('#map').width() + $('#chat').width() + 40) + 'px')
        .css('margin', 'auto');
}

$(function(){
    $('[data-tile]').on('click', function(e){
        var x = $(this).attr('data-x');
        var y = $(this).attr('data-y');
        moveSkeletonToTile(1, x, y);
    });

    $('#map .nametag').on('click', function(e){
        e.preventDefault();
        return false;
    });

    updateCounts();
    updateDropShadows();
    updateRoomWidth();
});