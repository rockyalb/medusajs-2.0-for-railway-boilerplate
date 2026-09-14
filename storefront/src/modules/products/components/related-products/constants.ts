/** The related rail's intentionally small initial and demand-loaded batches. */
export const RELATED_PRODUCTS_INITIAL_LIMIT = 2
export const RELATED_PRODUCTS_PAGE_SIZE = 6

// The client-safe field selection is shared with the server query tests only;
// it contains the fields needed by the card mapper and quick-add guard.
export const RELATED_PRODUCTS_FIELDS =
  "id,title,handle,thumbnail,*images,*variants.calculated_price,+variants.inventory_quantity"
