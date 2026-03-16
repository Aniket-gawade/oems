package com.project.oems.common.persistence;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EnumDbMapperTest {

    @Test
    void mapsEnumToDatabaseValue() {
        assertEquals("ALPHA", EnumDbMapper.toDbValue(SampleEnum.ALPHA));
    }

    @Test
    void mapsDatabaseValueToEnum() {
        assertEquals(SampleEnum.BETA, EnumDbMapper.fromDbValue(SampleEnum.class, "BETA"));
    }

    @Test
    void supportsNullValues() {
        assertNull(EnumDbMapper.toDbValue(null));
        assertNull(EnumDbMapper.fromDbValue(SampleEnum.class, null));
    }

    @Test
    void throwsForInvalidDatabaseValue() {
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> EnumDbMapper.fromDbValue(SampleEnum.class, "UNKNOWN")
        );
        assertTrue(exception.getMessage().contains("Invalid enum db value"));
    }

    private enum SampleEnum {
        ALPHA,
        BETA
    }
}
