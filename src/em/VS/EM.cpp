// EM.cpp : This file contains the 'main' function. Program execution begins and ends there.
//

#include <iostream>
#include "../main.hpp"
#include "../IsoSurface.hpp"

using namespace linalg::aliases;


// high_resolution_clock example
#include <iostream>
#include <ctime>
#include <ratio>
#include <chrono>

//Simple native test of emscripten interface
int main()
{
	using namespace std::chrono;

	int w = 256;
	int h = 256;
	int d = 256;
	Volume16* vol = createVolume(w, h, d);
	uint16_t* data = getVolumeData(vol);

	float3 v;
	float3 midpnt((float)w * 0.5f, (float)h * 0.5f, (float)d * 0.5f);
	int idx = 0;
	for (int i = 0; i < d; i++) {
		for (int j = 0; j < h; j++) {
			for (int k = 0; k < w; k++) {
				v = float3((float)i, (float)j, (float)k);
				float3 d = v - midpnt;
				float dist = length(d)/length(midpnt);
				data[idx++] = (uint16_t)(0xffff * dist);

			}
		}
	}
	high_resolution_clock::time_point t1 = high_resolution_clock::now();

	IsoSurface *iso = createIsoSurface();

	buildIsoSurface(iso, vol, 32767);

	high_resolution_clock::time_point t2 = high_resolution_clock::now();

	duration<double> time_span = duration_cast<duration<double>>(t2 - t1);
	std::cout << time_span.count() << std::endl;
	std::cout << iso->getVertexCount() << " verts generated" << std::endl;
}

// Run program: Ctrl + F5 or Debug > Start Without Debugging menu
// Debug program: F5 or Debug > Start Debugging menu

// Tips for Getting Started: 
//   1. Use the Solution Explorer window to add/manage files
//   2. Use the Team Explorer window to connect to source control
//   3. Use the Output window to see build output and other messages
//   4. Use the Error List window to view errors
//   5. Go to Project > Add New Item to create new code files, or Project > Add Existing Item to add existing code files to the project
//   6. In the future, to open this project again, go to File > Open > Project and select the .sln file
