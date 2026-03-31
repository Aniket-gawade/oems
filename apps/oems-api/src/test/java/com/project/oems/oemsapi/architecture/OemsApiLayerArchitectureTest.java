package com.project.oems.oemsapi.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

class OemsApiLayerArchitectureTest {

    private static final String BASE_PACKAGE = "com.project.oems.oemsapi..";

    @Test
    void domainLayerMustRemainIndependentFromOuterLayers() {
        JavaClasses classes = importedClasses();

        noClasses()
                .that()
                .resideInAnyPackage("com.project.oems.oemsapi.domain..")
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage(
                        "com.project.oems.oemsapi.api..",
                        "com.project.oems.oemsapi.application..",
                        "com.project.oems.oemsapi.infrastructure..",
                        "com.project.oems.oemsapi.config.."
                )
                .check(classes);
    }

    @Test
    void apiLayerMustNotAccessInfrastructureLayerDirectly() {
        JavaClasses classes = importedClasses();

        noClasses()
                .that()
                .resideInAnyPackage("com.project.oems.oemsapi.api..")
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage("com.project.oems.oemsapi.infrastructure..")
                .check(classes);
    }

    @Test
    void infrastructureLayerMustNotDependOnApiLayer() {
        JavaClasses classes = importedClasses();

        noClasses()
                .that()
                .resideInAnyPackage("com.project.oems.oemsapi.infrastructure..")
                .should()
                .dependOnClassesThat()
                .resideInAnyPackage("com.project.oems.oemsapi.api..")
                .check(classes);
    }

    private JavaClasses importedClasses() {
        return new ClassFileImporter()
                .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
                .importPackages(BASE_PACKAGE);
    }
}
