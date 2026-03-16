package com.project.oems.common.persistence;

import java.util.Objects;

public final class EnumDbMapper {

    private EnumDbMapper() {
    }

    public static <E extends Enum<E>> String toDbValue(E value) {
        return value == null ? null : value.name();
    }

    public static <E extends Enum<E>> E fromDbValue(Class<E> enumType, String value) {
        Objects.requireNonNull(enumType, "enumType must not be null");
        if (value == null) {
            return null;
        }

        try {
            return Enum.valueOf(enumType, value);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                "Invalid enum db value '" + value + "' for " + enumType.getSimpleName(),
                ex
            );
        }
    }
}
