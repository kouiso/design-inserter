<?php

use PHPUnit\Framework\TestCase;

final class TemplatePartyAvailabilityTest extends TestCase {
	private array $temporary_files = array();

	protected function tearDown(): void {
		foreach ( $this->temporary_files as $path ) {
			if ( file_exists( $path ) ) {
				unlink( $path );
			}
		}
	}

	private function createCatalogFile( $contents ): string {
		$path = tempnam( sys_get_temp_dir(), 'designinserter-tp-' );

		$this->assertNotFalse( $path );
		$this->assertNotFalse( file_put_contents( $path, $contents ) );
		$this->temporary_files[] = $path;

		return $path;
	}

	public function test_git_crypt_ciphertext_is_unavailable() {
		$path = $this->createCatalogFile( "\0GITCRYPT\0ciphertext" );

		$this->assertFalse( designinserter_tp_catalog_file_available( $path, 'parts' ) );
	}

	public function test_missing_file_is_unavailable() {
		$path = $this->createCatalogFile( '' );
		unlink( $path );

		$this->assertFalse(
			designinserter_tp_catalog_file_available(
				$path,
				'parts'
			)
		);
	}

	public function test_empty_array_is_available() {
		$path = $this->createCatalogFile( '{"parts":[]}' );

		$this->assertTrue( designinserter_tp_catalog_file_available( $path, 'parts' ) );
	}

	public function test_malformed_json_fails_loudly() {
		$path = $this->createCatalogFile( '{"parts":' );

		$this->expectException( UnexpectedValueException::class );
		designinserter_tp_catalog_file_available( $path, 'parts' );
	}

	public function test_missing_required_key_fails_loudly() {
		$path = $this->createCatalogFile( '{"templates":[]}' );

		$this->expectException( UnexpectedValueException::class );
		designinserter_tp_catalog_file_available( $path, 'parts' );
	}

	public function test_non_array_required_value_fails_loudly() {
		$path = $this->createCatalogFile( '{"parts":{}}' );

		$this->expectException( UnexpectedValueException::class );
		designinserter_tp_catalog_file_available( $path, 'parts' );
	}
}
