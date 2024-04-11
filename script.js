async function searchProduct() {
    const productName = document.getElementById("searchInput").value;
    const response = await fetch(`/search?product=${encodeURIComponent(productName)}`);
    const data = await response.json();
    displaySearchResults(data);
}

function displaySearchResults(data) {
    const searchResultsDiv = document.getElementById("searchResults");
    searchResultsDiv.innerHTML = "";

    if (data.error) {
        searchResultsDiv.textContent = data.error;
        return;
    }

    const bestSellerUrl = data.bestSellerUrl;
    const reviews = data.reviews;

    const bestSellerLink = document.createElement("a");
    bestSellerLink.href = bestSellerUrl;
    bestSellerLink.textContent = "Best Seller Book";

    const reviewsList = document.createElement("ol");
    reviews.forEach((review, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `Review ${index + 1}: ${review}`;
        reviewsList.appendChild(listItem);
    });

    searchResultsDiv.appendChild(bestSellerLink);
    searchResultsDiv.appendChild(reviewsList);
}
