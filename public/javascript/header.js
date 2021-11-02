const searchForm = document.querySelector('.my-search')

searchForm.addEventListener('submit', (e) => {
    e.preventDefault(); 
    const keyword = document.querySelector('.my-search-input').value

    window.location.href=`/product/search?keyword=${keyword}`
})