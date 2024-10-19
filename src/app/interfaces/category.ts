import { Subcategory } from "./subcategory";

export interface Category {
    cat_id: number;
    cat_name: string;
    cat_ordering: number;
    sub_category: Subcategory[];
    menu_active: boolean;
}
