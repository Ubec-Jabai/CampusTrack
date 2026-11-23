package com.jabai.campustrack.Repositories.Specifications;

import com.jabai.campustrack.Models.Asset;
import com.jabai.campustrack.Models.Enums.AssetCategory;
import com.jabai.campustrack.Models.Enums.AssetCondition;
import com.jabai.campustrack.Models.Enums.AssetCriticality;
import com.jabai.campustrack.Models.Enums.AssetStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Locale;

public class AssetSpecifications {


    public static Specification<Asset> hasId(Long id) {
        return (root, query, cb) -> {
            if (id == null)
                return null;
            return cb.equal(root.get("id"), id);
        };
    }


    public static Specification<Asset> hasRoomId(Long roomId) {
        return (root, query, cb) -> {
            if (roomId == null)
                return null;
            return cb.equal(root.get("room").get("id"), roomId);
        };
    }

    public static Specification<Asset> hasNameKeyword(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank())
                return null;
            String keyword = name
                    .trim()
                    .toLowerCase(Locale.ROOT)
                    .replace("\\", "\\\\").replace("%", "\\%")
                    .replace("_", "\\_");
            return cb.like(cb.lower(root.get("name")), "%" + keyword + "%", '\\');
        };
    }

    public static Specification<Asset> hasBrandKeyword(String brand) {
        return (root, query, cb) -> {
            if (brand == null || brand.isBlank())
                return null;
            String keyword = brand
                    .trim()
                    .toLowerCase(Locale.ROOT)
                    .replace("\\", "\\\\")
                    .replace("%", "\\%")
                    .replace("_", "\\_");
            return cb.like(cb.lower(root.get("brand")), "%" + keyword + "%", '\\');
        };
    }

    public static Specification<Asset> hasModelKeyword(String model) {
        return (root, query, cb) -> {
            if (model == null || model.isBlank())
                return null;
            String keyword = model
                    .trim()
                    .toLowerCase(Locale.ROOT)
                    .replace("\\", "\\\\")
                    .replace("%", "\\%")
                    .replace("_", "\\_");
            return cb.like(cb.lower(root.get("model")), "%" + keyword + "%", '\\');
        };
    }


    public static Specification<Asset> hasSerialNumber(String serialNumber) {
        return (root, query, cb) -> {
            if (serialNumber == null || serialNumber.isBlank())
                return null;
            return cb.equal(root.get("serialNumber"), serialNumber.trim());
        };
    }


    public static Specification<Asset> hasCategory(AssetCategory category) {
        return (root, query, cb) -> {
            if (category == null)
                return null;
            return cb.equal(root.get("category"), category);
        };
    }


    public static Specification<Asset> hasStatus(AssetStatus status) {
        return (root, query, cb) -> {
            if (status == null)
                return null;
            return cb.equal(root.get("status"), status);
        };
    }


    public static Specification<Asset> hasCondition(AssetCondition condition) {
        return (root, query, cb) -> {
            if (condition == null)
                return null;
            return cb.equal(root.get("condition"), condition);
        };
    }


    public static Specification<Asset> hasCriticality(AssetCriticality criticality) {
        return (root, query, cb) -> {
            if (criticality == null)
                return null;
            return cb.equal(root.get("criticality"), criticality);
        };
    }

    public static Specification<Asset> createdBetween(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from == null && to == null)
                return null;
            if (from == null)
                return cb.lessThanOrEqualTo(root.get("createdAt"), to);
            if (to == null)
                return cb.greaterThanOrEqualTo(root.get("createdAt"), from);
            return cb.between(root.get("createdAt"), from, to);
        };
    }
}