package com.wallet.responses;

public class Pagination {
    private int page;
    private int totalPages;
    private int totalItems;

    public Pagination(int page, int totalPages, int totalItems) {
        this.page = page;
        this.totalPages = totalPages;
        this.totalItems = totalItems;
    }

    public int getPage() {
        return page;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public int getTotalItems() {
        return totalItems;
    }
}
