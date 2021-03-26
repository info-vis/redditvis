$(document).ready(function() {
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    })
    // var popover1 = new bootstrap.Popover(document.querySelector('.popover1'), {
    //     container: 'info-button1'
    // })
    // var popover2 = new bootstrap.Popover(document.querySelector('.popover2'), {
    //     container: 'info-button2'
    //     })
    // var popover3 = new bootstrap.Popover(document.querySelector('.popover3'), {
    //     container: 'info-button3'
    //     })
    // var popover4 = new bootstrap.Popover(document.querySelector('.popover4'), {
    //     container: 'info-button4'
    // })
});


Vue.component('info-button1-target', {
    template: `
    <a tabindex="0" class="btn1-t" role="button" style="color:grey" data-bs-toggle="popover1-t" data-bs-trigger="focus" title="Top incoming subreddits" data-bs-content="If a target subreddit is selected, the top 10 incoming subreddits of this target subreddit are displayed."><i class="bi bi-info-square"></i></a>
    `
})

Vue.component('info-button1-both', {
    template: `
    <a tabindex="0" class="btn1-b" role="button" style="color:grey" data-bs-toggle="popover1-b" data-bs-trigger="focus" title="Number of posts" data-bs-content="If both source and target subreddits are selected, the top 10 number of posts of the source subreddit linking to the target subreddit is displayed."><i class="bi bi-info-square"></i></a>
    `
})

Vue.component('info-button1-none', {
    template: `
    <a tabindex="0" class="btn1-n" role="button" style="color:grey" data-bs-toggle="popover1-n" data-bs-trigger="focus" title="Top target subreddits" data-bs-content="If no subreddits are selected, the 10 most frequently hyperlinked subreddits in general are displayed. If a source subreddit is selected, the 10 most targeted subreddits of this source subreddit are displayed."><i class="bi bi-info-square"></i></a>
    `
})

Vue.component('info-button2', {
    template: `
    <a tabindex="0" class="btn2" role="button" style="color:grey" data-bs-toggle="popover2" data-bs-trigger="focus" title="Top topics of the post" data-bs-content="The top 10 highest averages of each topic for the selected posts are displayed.  In addition, the average of all posts from all subreddits is visualised as a diamond and allows exploring how the selection differs from all values (expressed as a percentage of words in the posts)."><i class="bi bi-info-square"></i></a>
    `
})

Vue.component('info-button3', {
    template: `
    <a tabindex="0" class="btn3" role="button" style="color:grey" data-bs-toggle="popover3" data-bs-trigger="focus" title="Topical processes of posts" data-bs-content="The distribution of psychological processes of the posts is shown. In addition, the average of all subreddits is displayed to allow a comparison between the selected and global values."><i class="bi bi-info-square"></i></a>
    `
})

Vue.component('info-button4', {
    template: `
    <a tabindex="0" class="btn4" role="button" style="color:grey" data-bs-toggle="popover4" data-bs-trigger="focus" title="Correlation of post properties" data-bs-content="This plot enables interactive visualization of the correlation between two selected properties. The user can explore the relationships between properties to see if they affect each other and draw their own insights. There are 50 properties to select from, including descriptive details and topics of the posts."><i class="bi bi-info-square"></i></a>
    `
})

Vue.component('info-button5', {
    template: `
    <a tabindex="0" class="btn5" role="button" style="color:grey" data-bs-toggle="popover5" data-bs-trigger="focus" title="Sentiment plot" data-bs-content="..."><i class="bi bi-info-square"></i></a>
    `
})

$(function() {
    $(".btn1-t").click(function(){
        $("[data-bs-toggle='popover1-t']").popover('toggle');
    });
});

$(function() {
    $(".btn1-b").click(function(){
        $("[data-bs-toggle='popover1-b']").popover('toggle');
    });
});

$(function() {
    $(".btn1-n").click(function(){
        $("[data-bs-toggle='popover1-n']").popover('toggle');
    });
});

$(function() {
    $(".btn2").click(function(){
        $("[data-bs-toggle='popover2']").popover('toggle');
    });
});

$(function() {
    $(".btn3").click(function(){
        $("[data-bs-toggle='popover3']").popover('toggle');
    });
});

$(function() {
    $(".btn4").click(function(){
        $("[data-bs-toggle='popover4']").popover('toggle');
    });
});

$(function() {
    $(".btn5").click(function(){
        $("[data-bs-toggle='popover5']").popover('toggle');
    });
});

// $(".bi-info-square 3").click(function(){
//     $("[data-bs-toggle='popover3']").popover('toggle');
// });

// $(".bi-info-square 4").click(function(){
//     $("[data-bs-toggle='popover4']").popover('toggle');
// });