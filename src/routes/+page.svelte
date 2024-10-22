<div class="m-auto h-screen flex items-center justify-center">
  <form
    action="/agent"
    method="get"
    class="bg-powder-blue rounded-lg w-2/5 text-delft-blue"
  >
    <div class="flex flex-col items-center text-center p-20">
      <h1 class="text-6xl text-maize mb-8">Mapsters</h1>
      <label class="w-full flex flex-col items-center">
        <h2>Travel to</h2>
        <input
          type="text"
          name="planet"
          class="p-2 text-xl text-center bg-greige"
          required
        />
      </label><br />
      <button type="submit" class="bg-greige w-1/5 p-4">Go!</button>
    </div>
    <a href="/mapmaker">Mapmakers, click here</a>
  </form>
</div>
