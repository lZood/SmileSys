/*
  # Add RLS policies for inventory items

  1. Security
    - Enable RLS on inventory_items table
    - Add policies for authenticated users to:
      - View all inventory items
      - Insert new items
      - Update existing items
      - Delete items
*/

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view inventory items"
ON inventory_items FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert inventory items"
ON inventory_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update inventory items"
ON inventory_items FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete inventory items"
ON inventory_items FOR DELETE
TO authenticated
USING (true);