package com.project.oems.common.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

class CommonModuleArchitectureTest {

    @Test
    void commonModuleMustNotDependOnContractsOrSpringPackages() {
        JavaClasses classes = new ClassFileImporter().importPackages("com.project.oems.common");

        noClasses()
            .that()
            .resideInAnyPackage("com.project.oems.common..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                "com.project.oems.contracts..",
                "org.springframework..",
                "org.springframework.boot.."
            )
            .check(classes);
    }
}
