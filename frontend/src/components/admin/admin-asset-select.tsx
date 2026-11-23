"use client";

import { useState } from "react";
import {
  Select,
  SelectInput,
  SelectItem,
  SelectList,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AssetResponseDto } from "@/types/asset";

interface AssetSelectProps {
  assets: AssetResponseDto[];
  selectedAssetId: number | null;
  onChange: (assetId: number | null) => void;
  placeholder: string;
  ariaLabel: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  allowClear?: boolean;
}

export function getAssetDisplayName(asset: AssetResponseDto): string {
  const meta: string[] = [];
  if (asset.brand) meta.push(asset.brand);
  if (asset.model) meta.push(asset.model);
  if (asset.serialNumber) meta.push(`S/N: ${asset.serialNumber}`);

  if (meta.length > 0) {
    return `${asset.name} (${meta.join(", ")})`;
  }
  return asset.name;
}

export function AssetSelect({
  assets,
  selectedAssetId,
  onChange,
  placeholder,
  ariaLabel,
  isDisabled = false,
  isLoading = false,
  allowClear = false,
}: AssetSelectProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const filteredAssets = query
    ? assets.filter((asset) => {
        const displayName = getAssetDisplayName(asset).toLowerCase();
        const serial = asset.serialNumber?.toLowerCase() ?? "";
        return displayName.includes(query) || serial.includes(query);
      })
    : assets;

  return (
    <Select
      className="w-full"
      placeholder={isLoading ? "Loading assets..." : placeholder}
      selectedKey={selectedAssetId ?? (allowClear ? 0 : null)}
      onSelectionChange={(key) => {
        if (key === 0) {
          onChange(null);
        } else if (typeof key === "number") {
          onChange(key);
        }
        setSearch("");
      }}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setSearch("");
        }
      }}
      aria-label={ariaLabel}
      isDisabled={isDisabled || isLoading}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectPopover>
        <SelectInput
          value={search}
          onChange={setSearch}
          aria-label={`Search ${ariaLabel.toLowerCase()}`}
        />
        <SelectList>
          {allowClear && <SelectItem id={0}>All assets</SelectItem>}
          {filteredAssets.map((asset) => (
            <SelectItem key={asset.id} id={asset.id}>
              {getAssetDisplayName(asset)}
            </SelectItem>
          ))}
          {filteredAssets.length === 0 && (
            <SelectItem id="no-assets" isDisabled>
              {assets.length === 0 ? "No assets in this room" : "No assets found"}
            </SelectItem>
          )}
        </SelectList>
      </SelectPopover>
    </Select>
  );
}
